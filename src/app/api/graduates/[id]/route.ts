import { NextResponse } from "next/server";
import { db } from "@/db";
import { graduates, connections, posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const graduateId = parseInt(id);

    const graduate = await db
      .select()
      .from(graduates)
      .where(eq(graduates.id, graduateId));

    if (!graduate.length) {
      return NextResponse.json(
        { error: "Egresado no encontrado" },
        { status: 404 }
      );
    }

    const graduateConnections = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          eq(connections.senderId, graduateId)
        )
      );

    const receivedConnections = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          eq(connections.receiverId, graduateId)
        )
      );

    const graduatePosts = await db
      .select()
      .from(posts)
      .where(eq(posts.graduateId, graduateId))
      .orderBy(posts.createdAt);

    return NextResponse.json({
      ...graduate[0],
      connectionsCount:
        graduateConnections.length + receivedConnections.length,
      postsCount: graduatePosts.length,
      posts: graduatePosts,
    });
  } catch (error) {
    console.error("Error fetching graduate:", error);
    return NextResponse.json(
      { error: "Error al obtener egresado" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const graduateId = parseInt(id);
    const body = await request.json();

    const updated = await db
      .update(graduates)
      .set({
        name: body.name,
        email: body.email,
        birthDate: body.birthDate,
        birthCountry: body.birthCountry,
        country: body.country,
        passport: body.passport,
        phone: body.phone,
        university: body.university,
        career: body.career,
        graduationYear: body.graduationYear,
        pregradoModalidad: body.pregradoModalidad,
        postgradoUniversity: body.postgradoUniversity,
        postgradoProgram: body.postgradoProgram,
        postgradoYear: body.postgradoYear,
        otherAcademicProgram: body.otherAcademicProgram,
        otherCubanInstitution: body.otherCubanInstitution,
        currentProfession: body.currentProfession,
        currentCompany: body.currentCompany,
        city: body.city,
        bio: body.bio,
        photoUrl: body.photoUrl,
        linkedin: body.linkedin,
        skills: body.skills,
        languages: body.languages,
        interests: body.interests,
        website: body.website,
        updatedAt: new Date(),
      })
      .where(eq(graduates.id, graduateId))
      .returning();

    if (!updated.length) {
      return NextResponse.json(
        { error: "Egresado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating graduate:", error);
    return NextResponse.json(
      { error: "Error al actualizar egresado" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const graduateId = parseInt(id);

    await db.delete(graduates).where(eq(graduates.id, graduateId));

    return NextResponse.json({ message: "Egresado eliminado" });
  } catch (error) {
    console.error("Error deleting graduate:", error);
    return NextResponse.json(
      { error: "Error al eliminar egresado" },
      { status: 500 }
    );
  }
}
