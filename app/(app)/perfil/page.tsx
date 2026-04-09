"use client";

import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun, Download, Bell } from "lucide-react";
import { useUser } from "@/lib/hooks";
import { createClient } from "@/lib/supabase-browser";

export default function PerfilPage() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="animate-fade-in space-y-4">
      <h1 className="font-display text-lg font-semibold">Perfil</h1>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-200/50 flex items-center justify-center font-display text-lg font-semibold text-brand-500">
            {(user?.email?.[0] || "P").toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{user?.user_metadata?.full_name || "Mi cuenta"}</p>
            <p className="text-xs text-brand-800/40">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-0 p-0 divide-y divide-warm-border">
        {[
          { icon: Sun, label: "Tema claro / oscuro", desc: "Próximamente", disabled: true },
          { icon: Bell, label: "Recordatorios", desc: "Próximamente", disabled: true },
          { icon: Download, label: "Exportar datos", desc: "Próximamente", disabled: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 opacity-60">
            <item.icon size={18} className="text-brand-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[11px] text-brand-800/40">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="card flex items-center gap-3 w-full text-left hover:shadow-md transition-shadow"
      >
        <LogOut size={18} className="text-rose" />
        <span className="text-sm font-medium text-rose">Cerrar sesión</span>
      </button>

      <p className="text-center text-[10px] text-brand-800/30 pt-4">Plan Diario v0.1.0</p>
    </div>
  );
}
