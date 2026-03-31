"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Graduate {
  id: number;
  name: string;
  country: string;
  university: string;
  career: string;
  photoUrl: string | null;
  currentProfession: string;
}

interface Connection {
  id: number;
  status: string;
  createdAt: string;
  senderId: number;
  receiverId: number;
  senderName: string;
  senderCountry: string;
  senderUniversity: string;
  senderCareer: string;
  senderPhoto: string | null;
  senderProfession: string;
}

export default function ConexionesPage() {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [selectedGraduate, setSelectedGraduate] = useState<number | null>(null);
  const [connections, setConnections] = useState<{
    sent: Connection[];
    received: Connection[];
  }>({ sent: [], received: [] });
  const [suggestions, setSuggestions] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/graduates")
      .then((r) => r.json())
      .then(setGraduates);
  }, []);

  const loadConnections = useCallback(async (id: number) => {
    const res = await fetch(`/api/connections?graduateId=${id}`);
    const data = await res.json();
    setConnections(data);

    const allGraduatesRes = await fetch("/api/graduates");
    const allGraduates: Graduate[] = await allGraduatesRes.json();
    const connectedIds = new Set([
      ...data.sent.map((c: Connection) => c.receiverId),
      ...data.received.map((c: Connection) => c.senderId),
      id,
    ]);
    const suggested = allGraduates
      .filter((g) => !connectedIds.has(g.id))
      .slice(0, 5);
    setSuggestions(suggested);
  }, []);

  useEffect(() => {
    if (selectedGraduate) {
      loadConnections(selectedGraduate);
    }
  }, [selectedGraduate, loadConnections]);

  async function sendConnection(receiverId: number) {
    if (!selectedGraduate) return;
    setLoading(true);
    try {
      await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: selectedGraduate,
          receiverId,
        }),
      });
      await loadConnections(selectedGraduate);
    } finally {
      setLoading(false);
    }
  }

  async function updateConnection(connectionId: number, status: string) {
    setLoading(true);
    try {
      await fetch("/api/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      });
      if (selectedGraduate) await loadConnections(selectedGraduate);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Conexiones</h1>
        <p className="text-neutral-400 mb-8">
          Gestiona tus conexiones con otros egresados
        </p>

        <div className="mb-8">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Ver como egresado:
          </label>
          <select
            onChange={(e) =>
              setSelectedGraduate(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Seleccionar egresado...</option>
            {graduates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} - {g.country}
              </option>
            ))}
          </select>
        </div>

        {selectedGraduate && (
          <div className="space-y-8">
            {connections.received.filter((c) => c.status === "pending").length >
              0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Solicitudes Pendientes
                </h2>
                <div className="space-y-3">
                  {connections.received
                    .filter((c) => c.status === "pending")
                    .map((c) => (
                      <div
                        key={c.id}
                        className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 flex items-center justify-between"
                      >
                        <Link
                          href={`/egresados/${c.senderId}`}
                          className="flex items-center gap-3 hover:opacity-80"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {c.senderName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {c.senderName}
                            </p>
                            <p className="text-neutral-400 text-xs">
                              {c.senderProfession} · {c.senderCountry}
                            </p>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateConnection(c.id, "accepted")}
                            disabled={loading}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => updateConnection(c.id, "rejected")}
                            disabled={loading}
                            className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {connections.sent.filter((c) => c.status === "pending").length >
              0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Enviadas (Pendientes)
                </h2>
                <div className="space-y-3">
                  {connections.sent
                    .filter((c) => c.status === "pending")
                    .map((c) => (
                      <Link
                        key={c.id}
                        href={`/egresados/${c.receiverId}`}
                        className="block bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 hover:border-neutral-600 transition-colors"
                      >
                        <p className="text-white font-medium text-sm">
                          {c.senderName}
                        </p>
                        <p className="text-neutral-400 text-xs">
                          Esperando respuesta...
                        </p>
                      </Link>
                    ))}
                </div>
              </section>
            )}

            {connections.sent.filter((c) => c.status === "accepted").length +
              connections.received.filter((c) => c.status === "accepted")
                .length >
              0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Conexiones Aceptadas
                </h2>
                <div className="space-y-3">
                  {[
                    ...connections.sent.filter((c) => c.status === "accepted"),
                    ...connections.received.filter(
                      (c) => c.status === "accepted"
                    ),
                  ].map((c) => (
                    <Link
                      key={c.id}
                      href={`/egresados/${c.senderId}`}
                      className="block bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 hover:border-neutral-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {c.senderName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {c.senderName}
                          </p>
                          <p className="text-neutral-400 text-xs">
                            {c.senderProfession} · {c.senderCountry}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {suggestions.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Sugerencias de Conexión
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 flex items-center justify-between"
                    >
                      <Link
                        href={`/egresados/${s.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {s.name}
                          </p>
                          <p className="text-neutral-400 text-xs">
                            {s.currentProfession} · {s.country}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => sendConnection(s.id)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Conectar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {!selectedGraduate && (
          <div className="text-center py-16 bg-neutral-800/30 border border-neutral-700/50 rounded-2xl">
            <p className="text-neutral-400 text-lg">
              Selecciona un egresado para gestionar sus conexiones
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
