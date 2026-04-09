"use client";

import { useEffect, useState } from "react";

export default function SaveIndicator({ saving }: { saving: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (saving) {
      setShow(true);
    } else {
      const t = setTimeout(() => setShow(false), 1500);
      return () => clearTimeout(t);
    }
  }, [saving]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] px-3.5 py-1.5 rounded-full text-xs font-medium bg-success-light text-success animate-fade-in pointer-events-none">
      {saving ? "Guardando..." : "✓ Guardado"}
    </div>
  );
}
