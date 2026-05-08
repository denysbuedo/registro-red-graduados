"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      if (data.pending && data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Bienvenido</h2>
        <p className="text-gray-500 font-semibold uppercase tracking-widest text-[10px]">Ingresa tus credenciales para continuar</p>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-rose-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-1">Username</label>
          <div className="relative">
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none placeholder-gray-300"
              placeholder="Tu nombre de usuario"
              required
              autoComplete="username"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Contraseña</label>
            <Link href="#" className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest hover:text-blue-700">¿Olvidaste tu clave?</Link>
          </div>
          <div className="relative">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none placeholder-gray-300"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4.5 bg-[#003f8f] hover:bg-[#002e6a] disabled:bg-gray-200 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] text-sm transition-all shadow-2xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3 group mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Entrar a la Red</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
