import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username, email, password, university,
      name, country, career, graduationYear, currentProfession,
      city, currentCompany, bio, phone, linkedin, website,
      skills, languages, interests, photoUrl,
    } = body;

    // Validaciones auth
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (!university || !name || !country || !career || !graduationYear || !currentProfession) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
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

    const passwordHash = await hashPassword(password);

    // Crear usuario en estado pendiente
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
        role: "user",
        status: "pending",
        pendingUniversity: university,
      })
      .returning();

    // Crear perfil de egresado (vinculado al usuario)
    await db
      .insert(graduates)
      .values({
        userId: newUser.id,
        name,
        email,
        country,
        city: city || null,
        university,
        career,
        graduationYear: parseInt(graduationYear),
        currentProfession,
        currentCompany: currentCompany || null,
        bio: bio || null,
        phone: phone || null,
        linkedin: linkedin || null,
        website: website || null,
        skills: skills || null,
        languages: languages || null,
        interests: interests || null,
        photoUrl: photoUrl || null,
      })
      .returning();

    return NextResponse.json({
      message: "Registro exitoso. Tu cuenta está pendiente de aprobación.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
