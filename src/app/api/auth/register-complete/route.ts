import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { eq, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      username, email, password, university, name, 
      birthDate, birthCountry, country, passport, phone,
      career, graduationYear, pregradoModalidad,
      postgradoUniversity, postgradoProgram, postgradoYear,
      otherAcademicProgram, otherCubanInstitution,
      currentProfession, currentCompany, city, 
      bio, photoUrl, linkedin, website, skills, languages, interests
    } = body;

    // Validaciones básicas
    if (!username || !email || !password || !university || !name || !birthDate || !birthCountry || !phone || !career || !graduationYear || !currentProfession || !currentCompany) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
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

    // 1. Crear usuario en estado pendiente
    const userResult = await db
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

    const newUser = userResult[0];

    // 2. Crear perfil de egresado vinculado
    const graduateResult = await db
      .insert(graduates)
      .values({
        userId: newUser.id,
        name,
        email,
        birthDate,
        birthCountry,
        country,
        passport,
        phone,
        university,
        career,
        graduationYear,
        pregradoModalidad: pregradoModalidad as any,
        postgradoUniversity,
        postgradoProgram: postgradoProgram as any,
        postgradoYear,
        otherAcademicProgram,
        otherCubanInstitution,
        currentProfession,
        currentCompany,
        city,
        bio,
        photoUrl,
        linkedin,
        website,
        skills,
        languages,
        interests,
      })
      .returning();

    const newGraduate = graduateResult[0];

    // 3. Vincular el graduateId al usuario
    await db
      .update(users)
      .set({ graduateId: newGraduate.id })
      .where(eq(users.id, newUser.id));

    // 4. Crear sesión
    await setSession({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role as any,
      status: newUser.status,
      pendingUniversity: newUser.pendingUniversity,
      graduateId: newGraduate.id,
    });

    return NextResponse.json(
      {
        message: "Registro exitoso. Tu cuenta está pendiente de aprobación.",
        pending: true,
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro completo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
