import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export function PublicLanding() {
  return (
    <main className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white">
      {/* Contenido dividido */}
      <div className="flex-1 flex overflow-hidden">
        {/* Izquierda: Info de la red - Fondo azul */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#003f8f] flex-col justify-center px-16 xl:px-24 text-white relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400 rounded-full blur-[120px] opacity-10 animate-pulse"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              Red de Graduados Internacionales
              <span className="block mt-2 text-2xl xl:text-3xl font-normal text-blue-200">
                de la Educación Superior Cubana
              </span>
            </h1>
            <p className="text-blue-100 text-lg max-w-md mt-8 leading-relaxed opacity-90">
              Conecta con profesionales que estudiaron en universidades cubanas. Comparte investigación, colaboraciones académicas y crece junto a tu red.
            </p>
            
            <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-10">
               <div className="text-center">
                 <p className="text-white text-2xl font-bold">38</p>
                 <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-widest mt-1">Universidades</p>
               </div>
               <div className="w-px h-10 bg-white/10"></div>
               <div className="text-center">
                 <p className="text-white text-2xl font-bold">150+</p>
                 <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-widest mt-1">Países</p>
               </div>
               <div className="w-px h-10 bg-white/10"></div>
               <div className="text-center">
                 <p className="text-white text-2xl font-bold">10k+</p>
                 <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-widest mt-1">Egresados</p>
               </div>
            </div>

            <div className="mt-12 flex gap-6 text-sm">
              <Link href="/estatutos" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                <span className="text-lg group-hover:scale-110 transition-transform">📖</span>
                <span className="underline underline-offset-4 decoration-blue-400">Ver Estatutos de la Red</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Derecha: Login + Registro - Fondo blanco */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-8 sm:px-12 overflow-y-auto">
          <div className="w-full max-w-sm">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-2xl font-bold text-[#003f8f]">Red de Graduados</h1>
              <p className="text-[#003f8f]/70 text-sm mt-1">Educación Superior Cubana</p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Registro */}
            <div className="text-center">
              <p className="text-base text-gray-700 mb-4">¿No tienes cuenta?</p>
              <Link href="/register" className="block w-full py-3 border-2 border-[#003f8f] text-[#003f8f] text-center rounded-lg font-semibold hover:bg-[#003f8f] hover:text-white transition-colors">
                Regístrate
              </Link>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Tu cuenta será revisada por tu universidad antes de ser aprobada.
              </p>
            </div>

            {/* Mobile links */}
            <div className="lg:hidden flex justify-center gap-6 text-sm text-gray-500 pt-6 mt-4 border-t border-gray-200">
              <Link href="/estatutos" className="flex items-center gap-1 text-[#003f8f] hover:underline">
                📖 Estatutos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer full-width */}
      <footer className="bg-[#002860] py-3 text-center text-sm text-blue-300 shrink-0 relative z-[60]">
        © 2026 Red de Graduados Internacionales · Ministerio de Educación Superior
      </footer>
    </main>
  );
}
