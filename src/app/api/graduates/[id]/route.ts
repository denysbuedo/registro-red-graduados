import { NextResponse } from "next/server";
import { db } from "@/db";
import { graduates, connections, posts, graduatePostgraduates } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const graduateId = parseInt(id);

    const graduate = await db.query.graduates.findFirst({
      where: eq(graduates.id, graduateId),
      with: { postgraduates: true },
    });

    if (!graduate) {
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
      ...graduate,
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
        university: body.university || (body.postgraduates?.[0]?.university) || null,
        career: body.career || (body.postgraduates?.[0]?.program) || null,
        graduationYear: body.graduationYear ? parseInt(body.graduationYear) : (body.postgraduates?.[0]?.year ? parseInt(body.postgraduates[0].year) : null),
        pregradoModalidad: body.pregradoModalidad || null,
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

    // Actualizar múltiples postgrados
    if (body.postgraduates) {
      await db.delete(graduatePostgraduates).where(eq(graduatePostgraduates.graduateId, graduateId));
      if (Array.isArray(body.postgraduates) && body.postgraduates.length > 0) {
        await db.insert(graduatePostgraduates).values(
          body.postgraduates.map((pg: any) => ({
            graduateId,
            program: pg.program,
            university: pg.university,
            year: parseInt(pg.year),
          }))
        );
      }
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
