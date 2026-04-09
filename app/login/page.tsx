"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Revisá tu correo para confirmar tu cuenta.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-brand-500 mb-1">Plan Diario</h1>
          <p className="text-sm text-brand-800/40">Tu cuaderno devocional digital</p>
        </div>

        <div className="card">
          <h2 className="font-display text-base font-semibold mb-4">
            {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="field-label">Correo electrónico</label>
              <input
                type="email"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div>
              <label className="field-label">Contraseña</label>
              <input
                type="password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-xs text-rose bg-rose-light px-3 py-2 rounded-lg">{error}</p>}
            {message && <p className="text-xs text-success bg-success-light px-3 py-2 rounded-lg">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[10px] text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Cargando..." : isSignUp ? "Crear cuenta" : "Entrar"}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
              className="text-xs text-brand-500 hover:underline"
            >
              {isSignUp ? "¿Ya tenés cuenta? Iniciá sesión" : "¿No tenés cuenta? Registrate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
