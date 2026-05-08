import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  await clearSession();
  return NextResponse.json({ message: "Logout exitoso" });
}

export async function GET(request: NextRequest) {
  await clearSession();
  const { searchParams } = new URL(request.url);
  const reason = searchParams.get("reason");

  let redirectUrl = new URL("/login", request.url);
  if (reason === "completed") {
    redirectUrl.searchParams.set("message", "Registro completado. Tu cuenta será gestionada por tu institución.");
  } else if (reason === "rejected") {
    redirectUrl.searchParams.set("error", "Tu cuenta ha sido rechazada.");
  }

  // Redirigir al inicio de sesión con el mensaje o error
  return NextResponse.redirect(redirectUrl);
}
