import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Ignorar archivos estáticos y APIs (excepto las que queramos proteger)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Si no hay sesión, permitir acceso a páginas públicas
  if (!sessionToken) {
    if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/terminos" || pathname === "/estatutos") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Decodificar sesión para ver status y role sin DB
    const decoded = atob(sessionToken);
    const session = JSON.parse(decoded);

    // 1. PRIORIDAD: Manejo de usuarios PENDIENTES
    if (session.status === "pending") {
      const allowedPaths = ["/pendiente", "/", "/estatutos", "/api/auth/logout"];
      const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith("/api/auth/logout"));
      
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/pendiente", request.url));
      }
      return NextResponse.next();
    }

    // 2. RESTRICCIÓN TOTAL EGRESADOS EN MODO LIGHT
    const isLightVersion = process.env.NEXT_PUBLIC_APP_VERSION === "light";
    if (isLightVersion) { // Changed this to enclose all Light Version logic
      if (session.role === "user") {
        // Si ya está aprobado, no tiene sentido que esté aquí. Lo echamos al logout con un flag de éxito.
        return NextResponse.redirect(new URL("/api/auth/logout?reason=completed", request.url));
      } else if (session.role === "institution") {
        // Si el rol es 'institution', redirigir directamente a su página de gestión
        if (pathname !== "/universidad") {
          return NextResponse.redirect(new URL("/universidad", request.url));
        }
      }
      // Para admin, permitimos el acceso a /admin y /directorio, pero no a /
      // Forzar al admin a /admin si está en /
      if (session.role === "admin" && pathname === "/") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    // 3. Manejo de usuarios RECHAZADOS
    if (session.status === "rejected") {
      return NextResponse.redirect(new URL("/api/auth/logout?reason=rejected", request.url));
    }

    // Si ya está aprobado y trata de entrar a páginas de auth/espera, ir a inicio
    if (session.status === "approved") {
      if (pathname === "/pendiente" || pathname === "/login" || pathname === "/register") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Sesión corrupta
    return NextResponse.redirect(new URL("/api/auth/logout", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
