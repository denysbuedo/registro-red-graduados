import "server-only";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "institution" | "editor";
  graduateId?: number | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = atob(sessionToken);
    const data = JSON.parse(decoded) as { userId: number };

    const user = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        graduateId: users.graduateId,
      })
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const token = btoa(JSON.stringify({ userId: user.id }));

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function getGraduateByUserId(userId: number) {
  const result = await db
    .select()
    .from(graduates)
    .where(eq(graduates.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
