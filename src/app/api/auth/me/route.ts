import { NextResponse } from "next/server";
import { getCurrentUser, getGraduateByUserId } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const graduate = user.graduateId
    ? await getGraduateByUserId(user.id)
    : null;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      graduateId: user.graduateId,
    },
    graduate,
  });
}
