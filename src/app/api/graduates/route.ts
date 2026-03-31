import { NextResponse } from "next/server";
import { db } from "@/db";
import { graduates } from "@/db/schema";
import { like, eq, and, gte, lte, sql } from "drizzle-orm";

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
        sql`(${graduates.name} LIKE ${"%" + search + "%"} OR ${graduates.currentProfession} LIKE ${"%" + search + "%"} OR ${graduates.bio} LIKE ${"%" + search + "%"})`
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newGraduate = await db
      .insert(graduates)
      .values({
        name: body.name,
        email: body.email,
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

    return NextResponse.json(newGraduate[0], { status: 201 });
  } catch (error) {
    console.error("Error creating graduate:", error);
    return NextResponse.json(
      { error: "Error al crear egresado" },
      { status: 500 }
    );
  }
}
