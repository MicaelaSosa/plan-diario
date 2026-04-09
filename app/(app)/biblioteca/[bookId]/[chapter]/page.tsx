"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useBibleBooks, useBookProgress } from "@/lib/hooks";
import SaveIndicator from "@/components/ui/SaveIndicator";
import { useState } from "react";
import clsx from "clsx";
import type { ChapterProgress } from "@/lib/types";

type ChapterField = keyof Pick<ChapterProgress, "learned" | "observations" | "words" | "meaning" | "application" | "notes" | "tags">;

export default function ChapterDetailPage() {
  const { bookId, chapter } = useParams<{ bookId: string; chapter: string }>();
  const router = useRouter();
  const books = useBibleBooks();
  const id = Number(bookId);
  const chNum = Number(chapter);
  const book = books.find((b) => b.id === id);
  const { chapters, toggleRead, updateChapterField } = useBookProgress(id);
  const [saving, setSaving] = useState(false);

  if (!book) return <div className="text-center py-10 text-brand-800/40">Cargando...</div>;

  const data = chapters[chNum];

  const handleField = (field: string, value: string) => {
    setSaving(true);
    updateChapterField(chNum, field, value).finally(() => {
      setTimeout(() => setSaving(false), 300);
    });
  };

  const Field = ({ label, field, textarea, placeholder }: { label: string; field: ChapterField; textarea?: boolean; placeholder?: string }) => (
    <div className="mb-4">
      <label className="field-label">{label}</label>
      {textarea ? (
        <textarea
          className="field-input resize-y min-h-[60px]"
          defaultValue={data?.[field] ?? ""}
          onBlur={(e) => handleField(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          className="field-input"
          defaultValue={data?.[field] ?? ""}
          onBlur={(e) => handleField(field, e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <SaveIndicator saving={saving} />

      <button onClick={() => router.push(`/biblioteca/${bookId}`)} className="flex items-center gap-1 text-sm text-brand-800/50 hover:text-brand-500 mb-3">
        <ChevronLeft size={16} />{book.name}
      </button>

      <div className="devotional-sheet">
        <h1 className="font-display text-xl font-semibold">{book.name} — Capítulo {chNum}</h1>
        {data?.read_date && <p className="text-xs text-brand-800/40 mt-1">Leído el {data.read_date}</p>}

        <button
          onClick={() => toggleRead(chNum)}
          className={clsx(
            "w-full py-3 rounded-[10px] text-sm font-medium transition-all mt-5 mb-6 border",
            data?.is_read
              ? "bg-success-light border-success text-success"
              : "border-warm-border text-brand-800/50 hover:border-brand-500"
          )}
        >
          {data?.is_read ? "✓ Leído" : "Marcar como leído"}
        </button>

        <Field label="¿Qué aprendí?" field="learned" textarea placeholder="Lecciones de este capítulo..." />
        <Field label="Observaciones" field="observations" textarea placeholder="Detalles, contexto, datos..." />
        <Field label="Palabras encontradas" field="words" placeholder="palabras clave..." />
        <Field label="Significado" field="meaning" textarea placeholder="¿Qué significa para mí?" />
        <Field label="Aplicación personal" field="application" textarea placeholder="¿Cómo lo aplico?" />
        <Field label="Notas" field="notes" textarea placeholder="Notas adicionales..." />
        <Field label="Etiquetas" field="tags" placeholder="fe, promesa, esperanza..." />
      </div>
    </div>
  );
}