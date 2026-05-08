"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { APP_CONFIG } from "@/lib/config";

interface GraduateCardProps {
  id: number;
  name: string;
  country: string;
  university: string | null;
  career: string | null;
  graduationYear: number | null;
  postgraduate?: { program: string; university: string; year: number } | null;
  isPostgraduateOnly?: boolean;
  currentProfession: string;
  currentCompany?: string | null;
  photoUrl?: string | null;
}

export function GraduateCard({
  id,
  name,
  country,
  university,
  career,
  graduationYear,
  postgraduate,
  isPostgraduateOnly,
  currentProfession,
  currentCompany,
  photoUrl,
}: GraduateCardProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "pending-sent" | "pending-received" | "connected" | "error"
  >("none");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkConnectionStatus();
  }, [id]);

  const checkConnectionStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch(`/api/connections?check=${id}`);
      
      if (response.status === 401) {
        setConnectionStatus("none");
        setChecking(false);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.status || "none");
      } else {
        setConnectionStatus("none");
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      setConnectionStatus("none");
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: id }),
      });

      const data = await response.json();

      if (response.ok) {
        setConnectionStatus("pending-sent");
      } else {
        alert(data.error || "Error al enviar solicitud");
      }
    } catch (error) {
      console.error("Error sending connection:", error);
      alert("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link 
      href={APP_CONFIG.features.individualProfiles ? `/egresados/${id}` : "#"}
      className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#003f8f] to-[#0052bd] flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              initials
            )}
          </div>
          {/* Status Indicator (Online/Verified etc - mock) */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-4 border-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="text-gray-900 font-bold text-lg tracking-tight group-hover:text-[#003f8f] transition-colors truncate mb-1">
            {name}
          </h3>
          <p className="text-gray-500 font-normal text-sm truncate leading-tight">
            {currentProfession}
          </p>
          {currentCompany && (
            <p className="text-[#003f8f] text-xs font-bold truncate mt-1">
              {currentCompany}
            </p>
          )}
        </div>
      </div>

          <div className="flex flex-col mt-6 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
            {!isPostgraduateOnly && university ? (
              <>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-blue-500 mt-0.5">🎓</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Universidad</p>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">{university}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">📚</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Especialidad</p>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">
                      {career} <span className="text-gray-400 font-normal">({graduationYear})</span>
                    </p>
                  </div>
                </div>
              </>
            ) : postgraduate ? (
              <>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-purple-500 mt-0.5">🎓</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Universidad (Posgrado)</p>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">{postgraduate.university}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">📘</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Programa</p>
                    <p className="text-xs font-semibold text-gray-700 leading-tight">
                      {postgraduate.program} <span className="text-gray-400 font-normal">({postgraduate.year})</span>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">🎓</span>
                <p className="text-xs font-medium text-gray-500 italic">Información académica no disponible</p>
              </div>
            )}
          </div>

      {/* Meta Information Badges */}
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-100">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {country}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-blue-50">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          </svg>
          {university?.split(" ").slice(0, 3).join(" ") || "—"}
        </span>
      </div>



      {/* Connection Action */}
      {APP_CONFIG.features.connections && (
        <div className="mt-6">
          {checking ? (
            <div className="w-full h-11 bg-gray-50 rounded-2xl animate-pulse"></div>
          ) : connectionStatus === "none" || connectionStatus === "error" ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full py-3 bg-[#003f8f] hover:bg-[#002e6a] text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Conectar
                </>
              )}
            </button>
          ) : connectionStatus === "pending-sent" ? (
            <div className="w-full py-3 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-amber-100 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" />
              </svg>
              Pendiente
            </div>
          ) : connectionStatus === "connected" ? (
            <div className="w-full py-3 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-green-100 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Conectado
            </div>
          ) : null}
        </div>
      )}
    </Link>
  );
}
