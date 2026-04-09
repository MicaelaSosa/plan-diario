"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "./supabase-browser";
import type { DailyEntry, ChapterProgress, BibleBook, Streak } from "./types";
import { todayKey } from "./constants";

const supabase = createClient();

// ── Auth ──────────────────────────────────────────────
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// ── Daily Entries ─────────────────────────────────────
export function useDailyEntry(dateStr: string) {
  const [entry, setEntry] = useState<Partial<DailyEntry>>({});
  const [saving, setSaving] = useState(false);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    supabase
      .from("daily_entries")
      .select("*")
      .eq("entry_date", dateStr)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEntry(data);
      });
  }, [dateStr]);

  const updateField = useCallback(
    (field: string, value: any) => {
      setEntry((prev) => ({ ...prev, [field]: value }));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from("daily_entries")
          .upsert(
            { user_id: user.id, entry_date: dateStr, [field]: value },
            { onConflict: "user_id,entry_date" }
          );
        setSaving(false);
      }, 800);
    },
    [dateStr]
  );

  return { entry, updateField, saving };
}

// ── Calendar entries (month) ──────────────────────────
export function useMonthEntries(year: number, month: number) {
  const [entries, setEntries] = useState<Record<string, Partial<DailyEntry>>>({});

  useEffect(() => {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    supabase
      .from("daily_entries")
      .select("entry_date, is_complete, reading")
      .gte("entry_date", startDate)
      .lte("entry_date", endDate)
      .then(({ data }) => {
        const map: Record<string, Partial<DailyEntry>> = {};
        data?.forEach((e) => { map[e.entry_date] = e; });
        setEntries(map);
      });
  }, [year, month]);

  return entries;
}

// ── Bible books (static, fetched once) ────────────────
export function useBibleBooks() {
  const [books, setBooks] = useState<BibleBook[]>([]);

  useEffect(() => {
    supabase
      .from("bible_books")
      .select("*")
      .order("sort_order")
      .then(({ data }) => { if (data) setBooks(data); });
  }, []);

  return books;
}

// ── Chapter progress for a book ───────────────────────
export function useBookProgress(bookId: number) {
  const [chapters, setChapters] = useState<Record<number, ChapterProgress>>({});

  useEffect(() => {
    if (!bookId) return;
    supabase
      .from("chapter_progress")
      .select("*")
      .eq("book_id", bookId)
      .then(({ data }) => {
        const map: Record<number, ChapterProgress> = {};
        data?.forEach((c) => { map[c.chapter_number] = c; });
        setChapters(map);
      });
  }, [bookId]);

  const toggleRead = useCallback(
    async (chapterNum: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const current = chapters[chapterNum];
      const isRead = !current?.is_read;
      await supabase
        .from("chapter_progress")
        .upsert(
          {
            user_id: user.id,
            book_id: bookId,
            chapter_number: chapterNum,
            is_read: isRead,
            read_date: isRead ? todayKey() : null,
          },
          { onConflict: "user_id,book_id,chapter_number" }
        );
      setChapters((prev) => ({
        ...prev,
        [chapterNum]: { ...prev[chapterNum], is_read: isRead, read_date: isRead ? todayKey() : null } as ChapterProgress,
      }));
    },
    [bookId, chapters]
  );

  const updateChapterField = useCallback(
    async (chapterNum: number, field: string, value: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("chapter_progress")
        .upsert(
          { user_id: user.id, book_id: bookId, chapter_number: chapterNum, [field]: value },
          { onConflict: "user_id,book_id,chapter_number" }
        );
      setChapters((prev) => ({
        ...prev,
        [chapterNum]: { ...prev[chapterNum], [field]: value } as ChapterProgress,
      }));
    },
    [bookId]
  );

  return { chapters, toggleRead, updateChapterField };
}

// ── Stats ─────────────────────────────────────────────
export function useStats() {
  const [stats, setStats] = useState({
    streak: 0,
    longestStreak: 0,
    completedDays: 0,
    totalChaptersRead: 0,
    totalChapters: 1189,
    completedBooks: 0,
  });

  useEffect(() => {
    (async () => {
      const [streakRes, entriesRes, chaptersRes] = await Promise.all([
        supabase.from("streaks").select("*").maybeSingle(),
        supabase.from("daily_entries").select("id", { count: "exact" }).eq("is_complete", true),
        supabase.from("chapter_progress").select("book_id, is_read").eq("is_read", true),
      ]);

      const chaptersRead = chaptersRes.data?.length || 0;

      // Count completed books
      const bookCounts: Record<number, number> = {};
      chaptersRes.data?.forEach((c) => {
        bookCounts[c.book_id] = (bookCounts[c.book_id] || 0) + 1;
      });

      // We need book chapter counts to determine completed books
      const booksRes = await supabase.from("bible_books").select("id, chapters");
      let completedBooks = 0;
      booksRes.data?.forEach((b) => {
        if ((bookCounts[b.id] || 0) >= b.chapters) completedBooks++;
      });

      setStats({
        streak: streakRes.data?.current_streak || 0,
        longestStreak: streakRes.data?.longest_streak || 0,
        completedDays: entriesRes.count || 0,
        totalChaptersRead: chaptersRead,
        totalChapters: 1189,
        completedBooks,
      });
    })();
  }, []);

  return stats;
}

// ── Search ────────────────────────────────────────────
export function useSearchEntries(query: string) {
  const [results, setResults] = useState<DailyEntry[]>([]);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("daily_entries")
        .select("*")
        .or(
          `reading.ilike.%${query}%,learned.ilike.%${query}%,notes.ilike.%${query}%,keywords.ilike.%${query}%,grateful.ilike.%${query}%`
        )
        .order("entry_date", { ascending: false })
        .limit(20);
      setResults(data || []);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return results;
}
