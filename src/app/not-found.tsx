import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-neutral-400 text-lg mb-8">
          Esta página no existe
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}
