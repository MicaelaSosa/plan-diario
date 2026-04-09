"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, BookOpen, Heart, Sun, Star, Tag, Music, PenLine, Flame } from "lucide-react";
import { useDailyEntry } from "@/lib/hooks";
import { formatDateLong, parseDateKey, DAYS_ES, MOODS } from "@/lib/constants";
import SaveIndicator from "@/components/ui/SaveIndicator";
import clsx from "clsx";

function SectionDivider({ icon: Icon }: { icon: any }) {
  return (
    <div className="flex items-center gap-2 my-5">
      <Icon size={14} className="text-brand-500/50" />
      <div className="flex-1 h-px bg-warm-borderLight" />
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  icon: any;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="mb-4">
      <label className="field-label">
        <Icon size={14} />
        {label}
      </label>
      {textarea ? (
        <textarea
          className="field-input resize-y min-h-[60px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          className="field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function DiaPage() {
  const { date } = useParams<{ date: string }>();
  const router = useRouter();
  const { entry, updateField, saving } = useDailyEntry(date);
  const dateObj = parseDateKey(date);
  const dayName = DAYS_ES[dateObj.getDay()];

  return (
    <div className="animate-fade-in">
      <SaveIndicator saving={saving} />

      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-brand-800/50 hover:text-brand-500 mb-3">
        <ChevronLeft size={16} />Volver
      </button>

      <div className="devotional-sheet">
        <h1 className="font-display text-xl font-semibold">{formatDateLong(date)}</h1>
        <p className="text-xs text-brand-800/40 uppercase tracking-widest mb-5">{dayName}</p>

        <SectionDivider icon={BookOpen} />
        <Field label="Lectura del día" icon={BookOpen} value={entry.reading || ""} onChange={(v) => updateField("reading", v)} placeholder="Ej: Salmos 23" />
        <Field label="Lo que aprendí" icon={Star} value={entry.learned || ""} onChange={(v) => updateField("learned", v)} textarea placeholder="¿Qué me habló hoy?" />
        <Field label="Cómo aplicar" icon={Heart} value={entry.apply || ""} onChange={(v) => updateField("apply", v)} textarea placeholder="¿Cómo lo llevo a mi vida?" />

        <SectionDivider icon={Heart} />
        <Field label="Hoy agradezco por" icon={Sun} value={entry.grateful || ""} onChange={(v) => updateField("grateful", v)} textarea placeholder="Gratitud del día..." />
        <Field label="Versículo clave" icon={Star} value={entry.verse || ""} onChange={(v) => updateField("verse", v)} placeholder="Escribe el versículo que te marcó" />
        <Field label="Palabras clave" icon={Tag} value={entry.keywords || ""} onChange={(v) => updateField("keywords", v)} placeholder="fe, esperanza, gracia..." />

        <SectionDivider icon={Music} />
        <Field label="Alabanza / Música del día" icon={Music} value={entry.music || ""} onChange={(v) => updateField("music", v)} placeholder="¿Qué canción te acompañó?" />

        <SectionDivider icon={PenLine} />
        <Field label="Notas libres" icon={PenLine} value={entry.notes || ""} onChange={(v) => updateField("notes", v)} textarea placeholder="Reflexiones, oraciones, pensamientos..." />

        {/* Mood */}
        <div className="mb-4">
          <label className="field-label"><Sun size={14} />Estado emocional</label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => updateField("mood", entry.mood === m ? "" : m)}
                className={clsx(
                  "px-3 py-1.5 rounded-full border text-sm transition-all",
                  entry.mood === m
                    ? "bg-brand-200/50 border-brand-500 text-brand-500"
                    : "border-warm-borderLight hover:border-brand-300"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <Field label="Intención del día" icon={Flame} value={entry.intention || ""} onChange={(v) => updateField("intention", v)} placeholder="¿Qué quiero lograr hoy?" />

        {/* Complete button */}
        <div className="border-t border-warm-border pt-4 mt-4">
          <button
            onClick={() => updateField("is_complete", !entry.is_complete)}
            className={clsx(
              "w-full py-3 rounded-[10px] text-sm font-medium transition-all",
              entry.is_complete
                ? "bg-brand-200/50 text-brand-500"
                : "bg-brand-500 text-white hover:bg-brand-600"
            )}
          >
            {entry.is_complete ? "✓ Día completado — Desmarcar" : "Marcar día como completo"}
          </button>
        </div>
      </div>
    </div>
  );
}
