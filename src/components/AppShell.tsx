"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { AutoRefresh } from "./AutoRefresh";

// Rutas donde NO mostrar el navbar
const HIDDEN_PATHS = ["/pendiente", "/login", "/register"];

export function AppShell() {
  const pathname = usePathname();
  const shouldShowNav = !HIDDEN_PATHS.includes(pathname || "");

  return (
    <>
      {shouldShowNav && <AutoRefresh />}
      {shouldShowNav && <Navbar />}
    </>
  );
}
