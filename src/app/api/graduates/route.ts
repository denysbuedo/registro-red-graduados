import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { graduates, users } from "@/db/schema";
import { like, eq, and, gte, lte, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const country = searchParams.get("country");
    const university = searchParams.get("university");
    const career = searchParams.get("career");
    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");

    const conditions = [];

    if (search) {
      conditions.push(
        sql`${graduates.name} LIKE ${"%" + search + "%"}`
      );
    }
    if (country) {
      conditions.push(eq(graduates.country, country));
    }
    if (university) {
      conditions.push(eq(graduates.university, university));
    }
    if (career) {
      conditions.push(eq(graduates.career, career));
    }
    if (yearFrom) {
      conditions.push(gte(graduates.graduationYear, parseInt(yearFrom)));
    }
    if (yearTo) {
      conditions.push(lte(graduates.graduationYear, parseInt(yearTo)));
    }

    const query =
      conditions.length > 0
        ? db
            .select()
            .from(graduates)
            .where(and(...conditions))
        : db.select().from(graduates);

    const allGraduates = await query.orderBy(graduates.createdAt);

    return NextResponse.json(allGraduates);
  } catch (error) {
    console.error("Error fetching graduates:", error);
    return NextResponse.json(
      { error: "Error al obtener egresados" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para registrarte como egresado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verificar si el usuario ya tiene un perfil de egresado
    const existingGraduate = await db
      .select()
      .from(graduates)
      .where(eq(graduates.userId, session.id))
      .limit(1);

    if (existingGraduate.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes un perfil de egresado registrado" },
        { status: 400 }
      );
    }

    const newGraduate = await db
      .insert(graduates)
      .values({
        userId: session.id,
        name: body.name,
        email: body.email || session.email,
        country: body.country,
        city: body.city || null,
        university: body.university,
        career: body.career,
        graduationYear: body.graduationYear,
        currentProfession: body.currentProfession,
        currentCompany: body.currentCompany || null,
        bio: body.bio || null,
        photoUrl: body.photoUrl || null,
        phone: body.phone || null,
        linkedin: body.linkedin || null,
        skills: body.skills || null,
        languages: body.languages || null,
        interests: body.interests || null,
        website: body.website || null,
      })
      .returning();

    // Actualizar el usuario con el graduateId
    await db
      .update(users)
      .set({ graduateId: newGraduate[0].id })
      .where(eq(users.id, session.id));

    return NextResponse.json(newGraduate[0], { status: 201 });
  } catch (error) {
    console.error("Error creating graduate:", error);
    return NextResponse.json(
      { error: "Error al crear egresado" },
      { status: 500 }
    );
  }
}
