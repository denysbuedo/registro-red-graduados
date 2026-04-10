"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Auto-refresh cada 60 segundos
export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  return null;
}
