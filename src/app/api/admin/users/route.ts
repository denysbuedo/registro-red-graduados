import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, graduates, connections, posts, adminPosts, notifications, postReactions, postComments, userPosts, eventAttendees, events, groupMembers, groupPosts, groups, eventNotificationLog } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, like, sql, or } from "drizzle-orm"; // Added 'or'
import { hashPassword } from "@/lib/auth"; // Added hashPassword import

// GET - Obtener lista de usuarios (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    let conditions = [];

    if (search) {
      conditions.push(
        sql`${users.username} LIKE ${"%" + search + "%"} OR ${users.email} LIKE ${"%" + search + "%"}`
      );
    }

    if (role) {
      conditions.push(eq(users.role, role as any));
    }

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        graduateId: users.graduateId,
        graduateName: graduates.name,
        graduateCountry: graduates.country,
        institutionName: users.institutionName,
        ministry: users.ministry,
      })
      .from(users)
      .leftJoin(graduates, eq(users.id, graduates.userId))
      .orderBy(sql`users.created_at DESC`);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, email, password, role, institutionName, ministry } = body;

    // Validación básica
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const validRoles = ["user", "admin", "institution", "editor", "dri"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Rol inválido: ${role}. Roles válidos: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    if (role === "institution" && !institutionName) {
      return NextResponse.json(
        { error: "Para el rol 'institution', el nombre de la institución es requerido" },
        { status: 400 }
      );
    }

    if (role === "dri" && !ministry) {
      return NextResponse.json(
        { error: "Para el rol 'dri', el ministerio es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el username o email ya existen
    const existingUser = await db
      .select({ id: users.id })
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
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
        role,
        institutionName: role === "institution" ? institutionName : null,
        ministry: role === "dri" ? ministry : null,
        status: "approved", // Los usuarios creados manualmente están aprobados por defecto
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user: newUser[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario (solo admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, role, username, email } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // Verificar que no se esté modificando a sí mismo para quitar rol admin
    if (session.id === parseInt(id) && role && role !== "admin") {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol de administrador" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // If role is institution, institutionName might be provided
    // If role is not institution, clear institutionName
    if (role === "institution" && body.institutionName !== undefined) {
      updateData.institutionName = body.institutionName;
    } else if (role !== "institution") { // No need to check if institutionName exists in users schema
      updateData.institutionName = null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)));

    return NextResponse.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario (solo admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // No permitir eliminarse a sí mismo
    if (session.id === userId) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    // 0. Desvincular de admin_posts (Noticias)
    await db
      .update(adminPosts)
      .set({ authorId: null })
      .where(eq(adminPosts.authorId, userId));

    // Obtener el graduateId si existe
    const userGraduate = await db
      .select({ id: graduates.id })
      .from(graduates)
      .where(eq(graduates.userId, userId))
      .limit(1);

    if (userGraduate.length > 0) {
      const graduateId = userGraduate[0].id;

      // 1. Eliminar Notificaciones relacionadas al usuario
      await db.delete(notifications).where(eq(notifications.userId, userId));

      // 2. Eliminar conexiones
      await db.delete(connections).where(or(eq(connections.senderId, graduateId), eq(connections.receiverId, graduateId)));

      // 3. Eliminar Posts de usuario y sus dependencias
      // (Reacciones y Comentarios se limpian por graduateId o postId)
      await db.delete(postReactions).where(eq(postReactions.userId, userId));
      await db.delete(postComments).where(eq(postComments.graduateId, graduateId));
      await db.delete(userPosts).where(eq(userPosts.graduateId, graduateId));
      
      // 4. Eliminar Eventos y Asistencia
      await db.delete(eventAttendees).where(eq(eventAttendees.graduateId, graduateId));
      
      // Obtener IDs de eventos del usuario para limpiar sus logs
      const userEvents = await db.select({ id: events.id }).from(events).where(eq(events.organizerId, graduateId));
      for (const event of userEvents) {
        await db.delete(eventNotificationLog).where(eq(eventNotificationLog.eventId, event.id));
      }
      await db.delete(events).where(eq(events.organizerId, graduateId));

      // 5. Eliminar Grupos y Membresía
      await db.delete(groupMembers).where(eq(groupMembers.graduateId, graduateId));
      await db.delete(groupPosts).where(eq(groupPosts.graduateId, graduateId));
      await db.delete(groups).where(eq(groups.creatorId, graduateId));

      // 6. Desvincular graduateId del usuario para evitar bloqueos por FK mutua
      await db.update(users).set({ graduateId: null }).where(eq(users.id, userId));
      
      // 7. Eliminar perfil de graduado y posts antiguos
      await db.delete(posts).where(eq(posts.graduateId, graduateId));
      await db.delete(graduates).where(eq(graduates.id, graduateId));
    }

    // 7. Eliminar usuario final
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
