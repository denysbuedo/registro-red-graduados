import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { eq, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validaciones
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el username o email ya existen
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "El username o email ya están registrados" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const result = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
        role: "user",
      })
      .returning();

    const newUser = result[0];

    // Crear sesión
    await setSession({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role as "user" | "admin",
      graduateId: newUser.graduateId,
    });

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
