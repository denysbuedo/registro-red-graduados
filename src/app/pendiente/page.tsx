"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PendientePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#eff6ff,transparent_70%)]"></div>
      </div>

      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 p-10 sm:p-16 text-center border border-gray-100 relative overflow-hidden">
        {/* Progress Indicator */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <div className="h-full bg-[#003f8f] w-3/4 animate-pulse"></div>
        </div>

        <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-blue-500/10">
          <svg className="w-12 h-12 text-[#003f8f] animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
          Verificación de Registro en Curso
        </h1>
        
        <div className="space-y-6 text-gray-600 mb-12">
          <p className="text-lg">
            ¡Hola, <span className="font-bold text-gray-900">{user.username}</span>! Tu solicitud ha sido procesada con éxito por nuestro sistema.
          </p>
          <p className="text-sm leading-relaxed">
            Actualmente, la <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-black text-xs uppercase tracking-tighter border border-blue-100">{user.pendingUniversity || "Universidad correspondiente"}</span> está validando tus credenciales académicas.
          </p>
        </div>
        
        <div className="bg-[#f8fafc] rounded-[2rem] p-6 mb-10 text-left border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#003f8f]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Próximos Pasos</h3>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Una vez aprobada tu cuenta, recibirás una notificación oficial en tu correo electrónico. Podrás entonces acceder a todas las funcionalidades de la Red.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 py-4 bg-[#003f8f] hover:bg-[#002e6a] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ir al Inicio
          </Link>
          
          <Link
            href="/api/auth/logout"
            className="flex-1 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Cerrar Sesión
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-50">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
            Ministerio de Educación Superior · Cuba 2026
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </main>
  );
}
