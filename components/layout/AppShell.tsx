"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  BookOpen,
  BarChart3,
  Search,
  User,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { href: "/estadisticas", label: "Progreso", icon: BarChart3 },
  { href: "/notas", label: "Notas", icon: Search },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-[220px] min-h-screen border-r border-warm-border bg-warm-card px-3 py-6">
        <div className="font-display text-xl font-semibold text-brand-500 px-3 pb-6">
          Plan Diario
        </div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors mb-1",
              isActive(item.href)
                ? "bg-brand-200/50 text-brand-500 font-medium"
                : "text-brand-800/50 hover:text-brand-800 hover:bg-brand-100"
            )}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
        <div className="mt-auto">
          <Link
            href="/perfil"
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors",
              isActive("/perfil")
                ? "bg-brand-200/50 text-brand-500 font-medium"
                : "text-brand-800/50 hover:text-brand-800 hover:bg-brand-100"
            )}
          >
            <User size={20} />
            <span>Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-8 px-4 py-4 md:px-8 md:py-6">
        <div className="max-w-2xl mx-auto">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-warm-card border-t border-warm-border flex justify-around items-center py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] transition-colors",
              isActive(item.href) ? "text-brand-500" : "text-brand-800/40"
            )}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
