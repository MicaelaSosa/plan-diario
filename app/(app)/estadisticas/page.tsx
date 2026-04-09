"use client";

import { useEffect, useState } from "react";
import { Flame, CalendarDays, BookOpen, CheckCircle2 } from "lucide-react";
import { useStats } from "@/lib/hooks";
import { createClient } from "@/lib/supabase-browser";
import { DAYS_ES, dateKey } from "@/lib/constants";

export default function EstadisticasPage() {
  const stats = useStats();
  const supabase = createClient();
  const pct = Math.round((stats.totalChaptersRead / stats.totalChapters) * 100);

  // Weekly activity
  const [weekActivity, setWeekActivity] = useState<{ day: string; complete: boolean; hasEntry: boolean }[]>([]);

  useEffect(() => {
    (async () => {
      const days: string[] = [];
      const labels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(dateKey(d));
        labels.push(DAYS_ES[d.getDay()]);
      }

      const { data } = await supabase
        .from("daily_entries")
        .select("entry_date, is_complete")
        .in("entry_date", days);

      const map = new Map(data?.map((e) => [e.entry_date, e]) || []);
      setWeekActivity(
        days.map((dk, i) => ({
          day: labels[i],
          complete: map.get(dk)?.is_complete || false,
          hasEntry: map.has(dk),
        }))
      );
    })();
  }, []);

  const statCards = [
    { num: stats.streak, label: "Racha actual", icon: Flame },
    { num: stats.completedDays, label: "Días completados", icon: CalendarDays },
    { num: stats.completedBooks, label: "Libros completos", icon: BookOpen },
    { num: stats.totalChaptersRead, label: "Capítulos leídos", icon: CheckCircle2 },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="font-display text-lg font-semibold">Estadísticas</h1>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className="card text-center py-4">
            <s.icon size={18} className="mx-auto text-brand-500 mb-1" />
            <div className="font-display text-2xl font-bold text-brand-500">{s.num}</div>
            <div className="text-[10px] text-brand-800/40">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="field-label mb-2">Progreso total de la Biblia</div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-warm-borderLight rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-display text-lg font-semibold text-brand-500">{pct}%</span>
        </div>
        <p className="text-[11px] text-brand-800/40 mt-1.5">{stats.totalChaptersRead} de {stats.totalChapters} capítulos</p>
      </div>

      <div className="card">
        <div className="field-label mb-3">Actividad semanal</div>
        <div className="flex justify-between gap-1.5">
          {weekActivity.map((w, i) => (
            <div key={i} className="text-center flex-1">
              <div
                className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center border transition-all ${
                  w.complete
                    ? "bg-success-light border-success"
                    : w.hasEntry
                    ? "bg-brand-200/50 border-brand-300"
                    : "bg-warm-borderLight border-warm-borderLight"
                }`}
              >
                {w.complete && <CheckCircle2 size={14} className="text-success" />}
              </div>
              <span className="text-[10px] text-brand-800/40 mt-1 block">{w.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
