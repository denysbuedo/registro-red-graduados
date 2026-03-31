import { NextResponse } from "next/server";
import { db } from "@/db";
import { posts, graduates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        graduateId: posts.graduateId,
        graduateName: graduates.name,
        graduatePhoto: graduates.photoUrl,
        graduateCountry: graduates.country,
        graduateProfession: graduates.currentProfession,
      })
      .from(posts)
      .innerJoin(graduates, eq(posts.graduateId, graduates.id))
      .orderBy(posts.createdAt);

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Error al obtener publicaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newPost = await db
      .insert(posts)
      .values({
        graduateId: body.graduateId,
        content: body.content,
      })
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Error al crear publicación" },
      { status: 500 }
    );
  }
}
