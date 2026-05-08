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
    <main className="fixed inset-0 bg-white flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#eff6ff,transparent_70%)]"></div>
      </div>

      <div className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 sm:p-12 text-center border border-gray-100 relative overflow-hidden">
        {/* Progress Indicator */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50">
          <div className="h-full bg-[#003f8f] w-3/4 animate-pulse"></div>
        </div>

        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-8 h-8 text-[#003f8f] animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
          Verificación en Curso
        </h1>
        
        <div className="space-y-4 text-gray-600 mb-8">
          <p className="text-base">
            ¡Hola, <span className="font-semibold text-gray-900">{user.username}</span>! Tu solicitud ha sido procesada.
          </p>
          <p className="text-sm leading-relaxed px-4">
            La <span className="font-bold text-blue-800">{user.pendingUniversity || "Universidad correspondiente"}</span> está validando tus credenciales académicas en este momento.
          </p>
        </div>
        
        <div className="bg-[#f8fafc] rounded-2xl p-5 mb-8 text-left border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Próximos Pasos</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Una vez aprobada tu cuenta, recibirás una notificación en tu correo. Podrás entonces acceder a todas las funcionalidades de la Red.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 py-3 bg-[#003f8f] hover:bg-[#002e6a] text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            Ir al Inicio
          </Link>
          
          <Link
            href="/api/auth/logout"
            className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl font-medium text-sm transition-all"
          >
            Cerrar Sesión
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">
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
