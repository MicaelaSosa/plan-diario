-- ============================================================
-- PLAN DIARIO - Database Schema for Supabase
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. BIBLE_BOOKS (static reference data)
-- ============================================================
CREATE TABLE public.bible_books (
  id SMALLINT PRIMARY KEY,
  name TEXT NOT NULL,
  testament TEXT NOT NULL CHECK (testament IN ('AT', 'NT')),
  chapters SMALLINT NOT NULL,
  sort_order SMALLINT NOT NULL
);

-- ============================================================
-- 3. DAILY_ENTRIES (the devotional journal)
-- ============================================================
CREATE TABLE public.daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  reading TEXT DEFAULT '',
  learned TEXT DEFAULT '',
  apply TEXT DEFAULT '',
  grateful TEXT DEFAULT '',
  verse TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  music TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  mood TEXT DEFAULT '',
  intention TEXT DEFAULT '',
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_daily_entries_user_date ON public.daily_entries(user_id, entry_date DESC);
CREATE INDEX idx_daily_entries_complete ON public.daily_entries(user_id, is_complete) WHERE is_complete = TRUE;

ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entries" ON public.daily_entries FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 4. CHAPTER_PROGRESS (reading tracking per chapter)
-- ============================================================
CREATE TABLE public.chapter_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id SMALLINT NOT NULL REFERENCES public.bible_books(id),
  chapter_number SMALLINT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_date DATE,
  learned TEXT DEFAULT '',
  observations TEXT DEFAULT '',
  words TEXT DEFAULT '',
  meaning TEXT DEFAULT '',
  application TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter_number)
);

CREATE INDEX idx_chapter_progress_user_book ON public.chapter_progress(user_id, book_id);
CREATE INDEX idx_chapter_progress_read ON public.chapter_progress(user_id, is_read) WHERE is_read = TRUE;

ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.chapter_progress FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 5. STUDY_NOTES (standalone searchable notes)
-- ============================================================
CREATE TABLE public.study_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  book_id SMALLINT REFERENCES public.bible_books(id),
  chapter_number SMALLINT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_notes_user ON public.study_notes(user_id, created_at DESC);
CREATE INDEX idx_study_notes_tags ON public.study_notes USING GIN(tags);

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON public.study_notes FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 6. STREAKS (computed cache for performance)
-- ============================================================
CREATE TABLE public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 7. READING_PLANS
-- ============================================================
CREATE TABLE public.reading_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  total_days INT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reading_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  book_id SMALLINT NOT NULL REFERENCES public.bible_books(id),
  chapter_start SMALLINT NOT NULL,
  chapter_end SMALLINT NOT NULL,
  UNIQUE(plan_id, day_number)
);

CREATE TABLE public.user_reading_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.reading_plans(id),
  start_date DATE NOT NULL,
  current_day INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

ALTER TABLE public.user_reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON public.user_reading_plans FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 8. Helper functions
-- ============================================================

-- Update streak when entry is marked complete
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
DECLARE
  _streak INT := 0;
  _longest INT;
  _check_date DATE;
BEGIN
  IF NEW.is_complete = TRUE THEN
    _check_date := NEW.entry_date - INTERVAL '1 day';
    _streak := 1;

    WHILE EXISTS (
      SELECT 1 FROM public.daily_entries
      WHERE user_id = NEW.user_id AND entry_date = _check_date AND is_complete = TRUE
    ) LOOP
      _streak := _streak + 1;
      _check_date := _check_date - INTERVAL '1 day';
    END LOOP;

    SELECT COALESCE(longest_streak, 0) INTO _longest FROM public.streaks WHERE user_id = NEW.user_id;

    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_completed_date, updated_at)
    VALUES (NEW.user_id, _streak, GREATEST(_streak, COALESCE(_longest, 0)), NEW.entry_date, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = _streak,
      longest_streak = GREATEST(_streak, streaks.longest_streak),
      last_completed_date = NEW.entry_date,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_entry_complete
  AFTER INSERT OR UPDATE OF is_complete ON public.daily_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_daily_entries_updated BEFORE UPDATE ON public.daily_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_chapter_progress_updated BEFORE UPDATE ON public.chapter_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_study_notes_updated BEFORE UPDATE ON public.study_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
