"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, Flame, Pen, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { todayKey, greeting, MONTHS_ES, DAYS_ES } from "@/lib/constants";

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({ streak: 0, completedDays: 0, chaptersRead: 0, totalChapters: 1189 });
  const [todayEntry, setTodayEntry] = useState<any>(null);
  const today = new Date();
  const tk = todayKey();

  useEffect(() => {
    (async () => {
      const [entryRes, streakRes, daysRes, chapRes] = await Promise.all([
        supabase.from("daily_entries").select("*").eq("entry_date", tk).maybeSingle(),
        supabase.from("streaks").select("*").maybeSingle(),
        supabase.from("daily_entries").select("id", { count: "exact" }).eq("is_complete", true),
        supabase.from("chapter_progress").select("id", { count: "exact" }).eq("is_read", true),
      ]);
      setTodayEntry(entryRes.data);
      setStats({
        streak: streakRes.data?.current_streak || 0,
        completedDays: daysRes.count || 0,
        chaptersRead: chapRes.count || 0,
        totalChapters: 1189,
      });
    })();
  }, []);

  const pct = Math.round((stats.chaptersRead / stats.totalChapters) * 100);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Greeting */}
      <div>
        <p className="text-xs text-brand-800/40">
          {DAYS_ES[today.getDay()]}, {today.getDate()} de {MONTHS_ES[today.getMonth()]}
        </p>
        <h1 className="font-display text-2xl font-semibold">{greeting()} ✦</h1>
      </div>

      {/* Today card */}
      <Link href={`/dia/${tk}`} className="card block relative overflow-hidden hover:shadow-md transition-shadow">
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg,#c4956a,#d4a0a0)" }} />
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display text-base font-semibold mb-1">Mi día de hoy</h2>
            <p className="text-xs text-brand-800/40">
              {todayEntry?.is_complete ? "✓ Completado" : todayEntry?.reading ? "En progreso..." : "Toca para comenzar"}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${todayEntry?.is_complete ? "bg-success-light text-success" : "bg-brand-200/50 text-brand-500"}`}>
            {todayEntry?.is_complete ? <CheckCircle2 size={20} /> : <Pen size={18} />}
          </div>
        </div>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { num: stats.streak, label: "Racha", icon: <Flame size={16} className="text-brand-500" /> },
          { num: stats.completedDays, label: "Días", icon: <CalendarDays size={16} className="text-brand-500" /> },
          { num: `${pct}%`, label: "Biblia", icon: <BookOpen size={16} className="text-brand-500" /> },
        ].map((s, i) => (
          <div key={i} className="card text-center py-3 px-2">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <div className="font-display text-2xl font-bold text-brand-500">{s.num}</div>
            <div className="text-[10px] text-brand-800/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reading progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="field-label !mb-0">Progreso de lectura</span>
          <span className="text-[11px] text-brand-800/40">{stats.chaptersRead}/{stats.totalChapters} capítulos</span>
        </div>
        <div className="h-1.5 bg-warm-borderLight rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/calendario" className="card text-center py-4 hover:shadow-md transition-shadow">
          <CalendarDays size={28} className="mx-auto text-brand-800/60" />
          <p className="text-xs text-brand-800/50 mt-2">Calendario</p>
        </Link>
        <Link href="/biblioteca" className="card text-center py-4 hover:shadow-md transition-shadow">
          <BookOpen size={28} className="mx-auto text-brand-800/60" />
          <p className="text-xs text-brand-800/50 mt-2">Biblioteca</p>
        </Link>
      </div>
    </div>
  );
}
