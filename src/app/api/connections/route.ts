import { NextResponse } from "next/server";
import { db } from "@/db";
import { connections, graduates } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const graduateId = searchParams.get("graduateId");

    if (!graduateId) {
      return NextResponse.json(
        { error: "Se requiere graduateId" },
        { status: 400 }
      );
    }

    const id = parseInt(graduateId);

    const sent = await db
      .select({
        id: connections.id,
        status: connections.status,
        createdAt: connections.createdAt,
        senderId: connections.senderId,
        receiverId: connections.receiverId,
        senderName: graduates.name,
        senderCountry: graduates.country,
        senderUniversity: graduates.university,
        senderCareer: graduates.career,
        senderPhoto: graduates.photoUrl,
        senderProfession: graduates.currentProfession,
      })
      .from(connections)
      .innerJoin(graduates, eq(connections.receiverId, graduates.id))
      .where(eq(connections.senderId, id));

    const received = await db
      .select({
        id: connections.id,
        status: connections.status,
        createdAt: connections.createdAt,
        senderId: connections.senderId,
        receiverId: connections.receiverId,
        senderName: graduates.name,
        senderCountry: graduates.country,
        senderUniversity: graduates.university,
        senderCareer: graduates.career,
        senderPhoto: graduates.photoUrl,
        senderProfession: graduates.currentProfession,
      })
      .from(connections)
      .innerJoin(graduates, eq(connections.senderId, graduates.id))
      .where(eq(connections.receiverId, id));

    return NextResponse.json({ sent, received });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Error al obtener conexiones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const existing = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.senderId, body.senderId),
            eq(connections.receiverId, body.receiverId)
          ),
          and(
            eq(connections.senderId, body.receiverId),
            eq(connections.receiverId, body.senderId)
          )
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ya existe una conexión entre estos egresados" },
        { status: 400 }
      );
    }

    const newConnection = await db
      .insert(connections)
      .values({
        senderId: body.senderId,
        receiverId: body.receiverId,
      })
      .returning();

    return NextResponse.json(newConnection[0], { status: 201 });
  } catch (error) {
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Error al crear conexión" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updated = await db
      .update(connections)
      .set({ status: body.status })
      .where(eq(connections.id, body.connectionId))
      .returning();

    if (!updated.length) {
      return NextResponse.json(
        { error: "Conexión no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating connection:", error);
    return NextResponse.json(
      { error: "Error al actualizar conexión" },
      { status: 500 }
    );
  }
}
