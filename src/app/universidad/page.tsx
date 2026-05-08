import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { eq, or, like, and, sql, asc, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { APP_CONFIG } from "@/lib/config";
import { UniversityApprovalButtons } from "@/components/UniversityApprovalButtons"; // New import
import { revalidatePath } from "next/cache"; // New import

export const dynamic = "force-dynamic";

export default async function UniversidadPage() {
  const session = await getSession();

  // Redirigir si no hay sesión, es pendiente, rechazado o rol incorrecto
  if (!session || session.status === "pending" || session.status === "rejected") {
    redirect("/login");
  }
  if (session.role !== "institution") {
    // Solo las instituciones pueden ver esta página
    redirect("/"); // Redirigir al home si no es institución
  }

  const institutionName = session.institutionName;

  if (!institutionName) {
    // Debería tener institutionName si su rol es 'institution', pero por seguridad
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuración Incompleta</h1>
          <p className="text-gray-600 mb-8">Tu rol de institución no tiene un nombre asignado. Por favor, contacta al administrador.</p>
          <button
            onClick={() => window.location.href = "/api/auth/logout"}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    );
  }

  // TEMPORARY DEBUGGING LOGS
  console.log(`[DEBUG] Logged in institution: ${institutionName}`);

  // Server Action para refrescar los datos de la página
  const refreshPageData = async () => {
    "use server";
    revalidatePath("/universidad"); // Revalidar la ruta actual para refrescar los datos
  };

  // Obtener estadísticas de egresados aprobados para esta universidad
  const stats = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(graduates)
      .innerJoin(users, eq(graduates.userId, users.id))
      .where(and(eq(graduates.university, institutionName), eq(users.status, "approved"))),
    db
      .select({ country: graduates.country, count: sql<number>`count(*)` })
      .from(graduates)
      .innerJoin(users, eq(graduates.userId, users.id))
      .where(and(eq(graduates.university, institutionName), eq(users.status, "approved")))
      .groupBy(graduates.country)
      .orderBy(sql`count(*) DESC`)
      .limit(6),
  ]);

  const totalGraduates = stats[0][0]?.count || 0;
  const countriesResult = stats[1];

  // TEMPORARY DEBUGGING LOGS
  console.log(`[DEBUG] Total graduates for ${institutionName}: ${totalGraduates}`);
  console.log(`[DEBUG] Countries for ${institutionName}:`, countriesResult);

  // Obtener solicitudes pendientes de egresados de esta universidad
  const pendingGraduates = await db
    .select({
      id: graduates.id,
      name: graduates.name,
      email: graduates.email,
      country: graduates.country,
      career: graduates.career,
      graduationYear: graduates.graduationYear,
      createdAt: graduates.createdAt,
      status: users.status,
      pendingUniversity: users.pendingUniversity,
      userId: users.id, // Añadir userId aquí
    })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(
      and(
        eq(graduates.university, institutionName),
        eq(users.status, "pending"),
        eq(users.pendingUniversity, institutionName)
      )
    )
    .orderBy(asc(graduates.createdAt));

  // Obtener egresados aprobados de esta universidad
  const approvedGraduates = await db
    .select({
      id: graduates.id,
      name: graduates.name,
      email: graduates.email,
      country: graduates.country,
      career: graduates.career,
      graduationYear: graduates.graduationYear,
      currentProfession: graduates.currentProfession,
      currentCompany: graduates.currentCompany,
      photoUrl: graduates.photoUrl,
    })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(
      and(
        eq(graduates.university, institutionName),
        eq(users.status, "approved")
      )
    )
    .orderBy(asc(graduates.name));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Universidad</h1>
          <p className="text-gray-600 mt-1">Gestiona y revisa egresados de: <span className="font-semibold">{institutionName}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Egresados Registrados" value={totalGraduates} />
          <StatCard title="Países Representados" value={countriesResult.length} />
          <StatCard title="Solicitudes Pendientes" value={pendingGraduates.length} />
        </div>

        {/* Secciones de Solicitudes y Aprobados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitudes Pendientes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-yellow-600">⏳</span> Solicitudes Pendientes
            </h2>
            {pendingGraduates.length > 0 ? (
              <div className="space-y-4">
                {pendingGraduates.map((grad) => (
                  <div key={grad.id} className="border-b border-gray-100 py-3 last:border-b-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link 
                          href={`/egresados/${grad.id}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-[#003f8f] hover:underline flex items-center gap-1.5"
                        >
                          {grad.name}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <p className="text-xs text-gray-500">{grad.career} ({grad.graduationYear})</p>
                        <p className="text-xs text-gray-500">{grad.country}</p>
                      </div>
                      <UniversityApprovalButtons
                        graduateId={grad.id}
                        userId={grad.userId}
                        onRefresh={refreshPageData}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay solicitudes pendientes en este momento.
              </div>
            )}
          </div>

          {/* Graduados Aprobados */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">✅</span> Graduados Aprobados
            </h2>
            {approvedGraduates.length > 0 ? (
              <div className="space-y-4">
                {approvedGraduates.map((grad) => (
                  <div key={grad.id} className="border-b border-gray-100 py-3 last:border-b-0 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{grad.name}</p>
                      <p className="text-xs text-gray-500">{grad.currentProfession} {grad.currentCompany && `en ${grad.currentCompany}`}</p>
                    </div>
                    <Link href={`/egresados/${grad.id}`} className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-medium transition-colors">
                      Ver Perfil
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aún no hay egresados aprobados.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-[#003f8f]">{value}</p>
    </div>
  );
}
