"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Algo salió mal</h1>
        <p className="text-neutral-400 text-lg mb-8">
          Ha ocurrido un error inesperado
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          Intentar de Nuevo
        </button>
      </div>
    </main>
  );
}
