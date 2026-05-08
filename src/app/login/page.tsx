import { PublicLanding } from "@/components/PublicLanding";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  
  // Si ya está logueado, redirigir al Home
  if (session) {
    redirect("/");
  }

  return <PublicLanding />;
}
