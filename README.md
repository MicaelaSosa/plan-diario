# Plan Diario

Tu cuaderno devocional digital — seguimiento de lectura bíblica, journal diario, y progreso espiritual.

## Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend/Auth/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Fonts**: Playfair Display + DM Sans

## Setup rápido

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd plan-diario
npm install
```

### 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un nuevo proyecto
2. Copiar la **Project URL** y **anon key** desde Settings > API

### 3. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus valores de Supabase.

### 4. Ejecutar schema y seed en Supabase

En el **SQL Editor** de Supabase, ejecutar en orden:

1. `supabase/schema.sql` — crea tablas, RLS, triggers
2. `supabase/seed.sql` — carga los 66 libros de la Biblia

### 5. Habilitar Auth

En Supabase Dashboard > Authentication > Providers, habilitar **Email**.

### 6. Ejecutar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
app/
├── (app)/                  # Route group con AppShell
│   ├── dashboard/          # Inicio
│   ├── calendario/         # Calendario mensual
│   ├── dia/[date]/         # Ficha devocional del día
│   ├── biblioteca/         # Biblioteca bíblica (66 libros)
│   │   ├── [bookId]/       # Detalle de libro + grid de capítulos
│   │   └── [bookId]/[chapter]/ # Estudio por capítulo
│   ├── estadisticas/       # Progreso y racha
│   ├── notas/              # Buscador global
│   └── perfil/             # Configuración
├── login/                  # Auth (sin AppShell)
└── layout.tsx              # Root layout
components/
├── layout/AppShell.tsx     # Sidebar desktop + bottom nav mobile
└── ui/SaveIndicator.tsx    # Indicador de guardado automático
lib/
├── supabase-browser.ts     # Client-side Supabase
├── supabase-server.ts      # Server-side Supabase
├── types.ts                # Database types
├── constants.ts            # Helpers, meses, días
└── hooks.ts                # Custom hooks (auth, entries, progress, search)
supabase/
├── schema.sql              # Full database schema
└── seed.sql                # 66 Bible books seed
```

## Funcionalidades implementadas

- ✅ Auth (registro + login con email)
- ✅ Dashboard con resumen del día, racha, y progreso
- ✅ Calendario mensual interactivo con estados visuales
- ✅ Ficha devocional diaria (lectura, aprendizaje, gratitud, versículo, mood...)
- ✅ Biblioteca bíblica visual (66 libros, AT/NT)
- ✅ Detalle de libro con grid de capítulos
- ✅ Estudio por capítulo (marcar leído, notas, observaciones, etiquetas)
- ✅ Estadísticas (racha, días, capítulos, actividad semanal)
- ✅ Buscador global de notas
- ✅ Autosave con indicador visual
- ✅ Responsive (mobile-first + sidebar desktop)
- ✅ RLS (Row Level Security) por usuario
- ✅ Streak automático via trigger SQL

## Próximos pasos

- [ ] Tema oscuro
- [ ] Notificaciones/recordatorios
- [ ] Planes de lectura guiados
- [ ] Exportación de datos (PDF/CSV)
- [ ] PWA (offline + install)
- [ ] Compartir notas
