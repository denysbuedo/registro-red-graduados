import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validaciones
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario por username o email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Si está rechazado
    if (user.status === "rejected") {
      return NextResponse.json(
        { 
          error: "Tu cuenta fue rechazada.",
          reason: user.rejectionReason || "Sin motivo especificado",
        },
        { status: 403 }
      );
    }

    // Si está pendiente, crear sesión y redirigir a página de pendiente
    if (user.status === "pending") {
      await setSession({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as any,
        status: user.status,
        pendingUniversity: user.pendingUniversity,
        graduateId: user.graduateId,
      });

      return NextResponse.json({
        message: "Tu cuenta está pendiente de aprobación.",
        pending: true,
        redirect: "/pendiente",
      });
    }

    // Usuario aprobado - sesión normal
    await setSession({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as "user" | "admin" | "institution" | "editor",
      status: user.status,
      pendingUniversity: user.pendingUniversity,
      graduateId: user.graduateId,
    });

    return NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
