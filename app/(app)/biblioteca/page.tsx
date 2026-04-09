"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useBibleBooks } from "@/lib/hooks";
import clsx from "clsx";

export default function BibliotecaPage() {
  const books = useBibleBooks();
  const [filter, setFilter] = useState<"all" | "AT" | "NT">("all");
  const [progress, setProgress] = useState<Record<number, { read: number; total: number }>>({});
  const supabase = createClient();

  useEffect(() => {
    if (!books.length) return;
    supabase
      .from("chapter_progress")
      .select("book_id")
      .eq("is_read", true)
      .then(({ data }) => {
        const counts: Record<number, number> = {};
        data?.forEach((c) => { counts[c.book_id] = (counts[c.book_id] || 0) + 1; });
        const map: Record<number, { read: number; total: number }> = {};
        books.forEach((b) => { map[b.id] = { read: counts[b.id] || 0, total: b.chapters }; });
        setProgress(map);
      });
  }, [books]);

  const filtered = filter === "all" ? books : books.filter((b) => b.testament === filter);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-lg font-semibold mb-4">Biblioteca Bíblica</h1>

      <div className="flex gap-2 mb-4">
        {([["all", "Todos"], ["AT", "Antiguo T."], ["NT", "Nuevo T."]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              filter === k ? "bg-brand-500 text-white border-brand-500" : "border-warm-border text-brand-800/50 hover:border-brand-300"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5">
        {filtered.map((b) => {
          const p = progress[b.id] || { read: 0, total: b.chapters };
          const pct = Math.round((p.read / p.total) * 100);
          const isComplete = pct === 100;
          const spineColor = isComplete ? "#8DB580" : pct > 0 ? "#C4956A" : "#F0E6DA";

          return (
            <Link
              key={b.id}
              href={`/biblioteca/${b.id}`}
              className={clsx(
                "flex flex-col items-center p-3 rounded-xl border text-center transition-all hover:-translate-y-0.5 hover:shadow-md",
                isComplete ? "bg-success-light border-success" : "bg-warm-card border-warm-borderLight"
              )}
            >
              <div className="w-7 h-[42px] rounded-[3px_6px_6px_3px] mb-1.5" style={{ background: spineColor }} />
              <span className="text-[11px] font-medium leading-tight">{b.name}</span>
              <span className="text-[9px] text-brand-800/40 mt-0.5">
                {pct > 0 ? `${pct}%` : `${b.chapters} cap.`}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
