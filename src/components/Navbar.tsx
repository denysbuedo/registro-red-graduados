"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-800 via-white to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                CU
              </span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              Egresados Cuba
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/directorio">Directorio</NavLink>
            <NavLink href="/conexiones">Conexiones</NavLink>
            <NavLink href="/listas-correo">Listas Correo</NavLink>
            <Link
              href="/egresados/registro"
              className="ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Registro
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-800 pt-2">
            <div className="flex flex-col gap-1">
              <MobileNavLink href="/" onClick={() => setIsOpen(false)}>
                Inicio
              </MobileNavLink>
              <MobileNavLink href="/directorio" onClick={() => setIsOpen(false)}>
                Directorio
              </MobileNavLink>
              <MobileNavLink href="/conexiones" onClick={() => setIsOpen(false)}>
                Conexiones
              </MobileNavLink>
              <MobileNavLink
                href="/listas-correo"
                onClick={() => setIsOpen(false)}
              >
                Listas Correo
              </MobileNavLink>
              <MobileNavLink
                href="/egresados/registro"
                onClick={() => setIsOpen(false)}
              >
                + Registro
              </MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
