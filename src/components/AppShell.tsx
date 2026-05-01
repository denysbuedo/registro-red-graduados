"use client";

import { Navbar } from "./Navbar";

export function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
