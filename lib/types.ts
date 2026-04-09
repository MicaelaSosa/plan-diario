export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          theme: "light" | "dark";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      bible_books: {
        Row: {
          id: number;
          name: string;
          testament: "AT" | "NT";
          chapters: number;
          sort_order: number;
        };
        Insert: Database["public"]["Tables"]["bible_books"]["Row"];
        Update: Partial<Database["public"]["Tables"]["bible_books"]["Row"]>;
      };
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          reading: string;
          learned: string;
          apply: string;
          grateful: string;
          verse: string;
          keywords: string;
          music: string;
          notes: string;
          mood: string;
          intention: string;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_entries"]["Row"]> & {
          user_id: string;
          entry_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_entries"]["Row"]>;
      };
      chapter_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: number;
          chapter_number: number;
          is_read: boolean;
          read_date: string | null;
          learned: string;
          observations: string;
          words: string;
          meaning: string;
          application: string;
          notes: string;
          tags: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["chapter_progress"]["Row"]> & {
          user_id: string;
          book_id: number;
          chapter_number: number;
        };
        Update: Partial<Database["public"]["Tables"]["chapter_progress"]["Row"]>;
      };
      study_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          book_id: number | null;
          chapter_number: number | null;
          tags: string[];
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["study_notes"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["study_notes"]["Row"]>;
      };
      streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_completed_date: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["streaks"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["streaks"]["Row"]>;
      };
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type BibleBook = Database["public"]["Tables"]["bible_books"]["Row"];
export type DailyEntry = Database["public"]["Tables"]["daily_entries"]["Row"];
export type ChapterProgress = Database["public"]["Tables"]["chapter_progress"]["Row"];
export type StudyNote = Database["public"]["Tables"]["study_notes"]["Row"];
export type Streak = Database["public"]["Tables"]["streaks"]["Row"];
