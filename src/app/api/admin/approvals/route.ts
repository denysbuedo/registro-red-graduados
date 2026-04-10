import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, or, desc } from "drizzle-orm";

// GET - Obtener usuarios pendientes de aprobación
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "institution")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const pendingUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        rejectionReason: users.rejectionReason,
        createdAt: users.createdAt,
        graduateId: users.graduateId,
        graduateName: graduates.name,
        graduateUniversity: graduates.university,
        graduateCountry: graduates.country,
      })
      .from(users)
      .leftJoin(graduates, eq(users.id, graduates.userId))
      .where(eq(users.status, status as any))
      .orderBy(desc(users.createdAt));

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

// PUT - Aprobar o rechazar usuario
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "institution")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, reason } = body;

    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    if (action === "reject" && !reason) {
      return NextResponse.json(
        { error: "Debe especificar un motivo de rechazo" },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        status: action === "approve" ? "approved" : "rejected",
        rejectionReason: action === "reject" ? reason : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parseInt(userId)));

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Usuario aprobado" : "Usuario rechazado",
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}
