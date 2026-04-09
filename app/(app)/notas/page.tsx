"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";
import { useSearchEntries } from "@/lib/hooks";

export default function NotasPage() {
  const [query, setQuery] = useState("");
  const results = useSearchEntries(query);

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="font-display text-lg font-semibold">Notas y Búsqueda</h1>

      <div className="relative">
        <input
          className="field-input pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en tus notas..."
        />
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-800/30" />
      </div>

      {query.length >= 2 && results.length === 0 && (
        <div className="text-center py-10 text-brand-800/40">
          <FileText size={36} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No se encontraron resultados.</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-10 text-brand-800/40">
          <Search size={36} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Escribí para buscar en tus entradas, aprendizajes y notas.</p>
        </div>
      )}

      <div className="space-y-2">
        {results.map((e) => (
          <Link key={e.id} href={`/dia/${e.entry_date}`} className="card block py-3 px-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-1">
              <span className="font-display text-sm font-medium">{e.entry_date}</span>
              {e.is_complete && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-light text-success">Completo</span>
              )}
            </div>
            {e.reading && <p className="text-xs text-brand-800/50">📖 {e.reading}</p>}
            {e.learned && <p className="text-xs text-brand-800/40 mt-0.5 line-clamp-2">{e.learned}</p>}
            {e.keywords && (
              <div className="flex flex-wrap gap-1 mt-2">
                {e.keywords.split(",").slice(0, 3).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-brand-200/50 text-brand-500">
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
