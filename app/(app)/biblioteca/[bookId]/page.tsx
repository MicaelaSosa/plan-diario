"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useBibleBooks, useBookProgress } from "@/lib/hooks";
import clsx from "clsx";

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const router = useRouter();
  const books = useBibleBooks();
  const id = Number(bookId);
  const book = books.find((b) => b.id === id);
  const { chapters, toggleRead } = useBookProgress(id);

  if (!book) return <div className="text-center py-10 text-brand-800/40">Cargando...</div>;

  const readCount = Object.values(chapters).filter((c) => c.is_read).length;
  const pct = Math.round((readCount / book.chapters) * 100);

  return (
    <div className="animate-fade-in">
      <button onClick={() => router.push("/biblioteca")} className="flex items-center gap-1 text-sm text-brand-800/50 hover:text-brand-500 mb-3">
        <ChevronLeft size={16} />Biblioteca
      </button>

      <div className="card mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-lg font-semibold mb-1">{book.name}</h1>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-brand-200/50 text-brand-500">
              {book.testament === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}
            </span>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-brand-500">{pct}%</div>
            <div className="text-[10px] text-brand-800/40">{readCount}/{book.chapters}</div>
          </div>
        </div>
        <div className="h-1.5 bg-warm-borderLight rounded-full overflow-hidden mt-3">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card">
        <p className="field-label mb-3">Capítulos</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1.5">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => {
            const data = chapters[ch];
            const isRead = data?.is_read;
            const hasNotes = !!(data?.learned || data?.observations || data?.notes);

            return (
              <Link
                key={ch}
                href={`/biblioteca/${book.id}/${ch}`}
                className={clsx(
                  "w-11 h-11 rounded-[10px] flex items-center justify-center text-sm border transition-all",
                  isRead
                    ? "bg-success-light border-success text-success font-semibold"
                    : "bg-warm-cream border-warm-borderLight hover:border-brand-500",
                  hasNotes && !isRead && "shadow-[inset_0_-3px_0_#E8D5C0]"
                )}
              >
                {ch}
              </Link>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-brand-800/40 mt-4">Toca un capítulo para marcar como leído y dejar notas</p>
      </div>
    </div>
  );
}
