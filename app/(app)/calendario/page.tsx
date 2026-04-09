"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMonthEntries } from "@/lib/hooks";
import { MONTHS_ES, DAYS_ES, todayKey } from "@/lib/constants";
import clsx from "clsx";

const BADGE_COLORS = [
  { bg: "bg-[#F5EBE0]", text: "text-[#C4956A]" },       // terracota
  { bg: "bg-[#EDE8F2]", text: "text-[#8B72AE]" },       // lavanda
  { bg: "bg-[#F5E6E6]", text: "text-[#C47E7E]" },       // rosa
  { bg: "bg-[#E4ECE3]", text: "text-[#6E8F6A]" },       // sage
  { bg: "bg-[#E0EEF5]", text: "text-[#5E8FAD]" },       // celeste
  { bg: "bg-[#FFF3E0]", text: "text-[#D4943A]" },       // dorado
];

function hashColor(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % BADGE_COLORS.length;
}

export default function CalendarioPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const entries = useMonthEntries(year, month);
  const tk = todayKey();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-lg font-semibold mb-4">Calendario</h1>
      <div className="card">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prev} className="p-2 rounded-lg hover:bg-brand-200/30 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="font-display text-base font-semibold">{MONTHS_ES[month]} {year}</span>
          <button onClick={next} className="p-2 rounded-lg hover:bg-brand-200/30 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1">
          {DAYS_ES.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-brand-800/40 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const dk = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const entry = entries[dk];
            const isToday = dk === tk;
            const isComplete = entry?.is_complete;
            const hasReading = !!entry?.reading;
            const hasEntry = !!entry;

            const color = hasReading ? BADGE_COLORS[hashColor(entry!.reading!)] : null;

            return (
              <Link
                key={dk}
                href={`/dia/${dk}`}
                className={clsx(
                  "rounded-[10px] relative transition-all flex flex-col items-center justify-start p-1",
                  "min-h-[56px] md:min-h-[72px]",
                  isToday && "ring-2 ring-brand-500",
                  hasReading && color?.bg,
                  isComplete && !hasReading && "bg-success-light",
                  !isComplete && !hasReading && "hover:bg-brand-200/30"
                )}
              >
                {/* Day number */}
                <span className={clsx(
                  "text-sm leading-none",
                  isToday && "font-bold",
                  isComplete && "font-semibold",
                  isComplete && !hasReading && "text-success",
                  hasReading && color?.text && "font-semibold"
                )}>
                  {d}
                </span>

                {/* Reading badge */}
                {hasReading && (
                  <span className={clsx(
                    "mt-0.5 px-0.5 rounded text-[7px] md:text-[8px] font-semibold leading-tight text-center truncate max-w-full",
                    color?.text
                  )}>
                    {entry!.reading!.length > 12 ? entry!.reading!.slice(0, 12) : entry!.reading}
                  </span>
                )}

                {/* Complete checkmark */}
                {isComplete && (
                  <span className={clsx(
                    "text-[9px] mt-auto font-bold",
                    hasReading ? color?.text : "text-success"
                  )}>
                    ✓
                  </span>
                )}

                {/* Dot for entries without reading */}
                {hasEntry && !hasReading && !isComplete && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 px-1">
        {[
          { color: "bg-brand-500", label: "Con notas" },
          { color: "bg-success", label: "Completo" },
          { color: "bg-[#C4956A]", label: "Con lectura" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[10px] text-brand-800/40">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
