export default function PendientePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#003f8f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Registro Enviado!
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Tu registro ha sido recibido correctamente. Tu universidad revisará tu información y aprobará tu cuenta.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-blue-800 font-medium mb-2">¿Qué sigue?</p>
          <ul className="text-sm text-blue-700 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">1.</span>
              <span>Tu universidad revisará tu solicitud</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">2.</span>
              <span>Cuando sea aprobada, podrás iniciar sesión</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">3.</span>
              <span>Tendrás acceso completo a la red</span>
            </li>
          </ul>
        </div>

        <a
          href="/login"
          className="block w-full py-3.5 bg-[#003f8f] hover:bg-[#002860] text-white rounded-lg font-semibold transition-colors"
        >
          Ir al Login
        </a>
      </div>
    </main>
  );
}
