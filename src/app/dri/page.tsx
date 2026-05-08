import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UniversityApprovalButtons } from "@/components/UniversityApprovalButtons";
import { revalidatePath } from "next/cache";

import { getUniversitiesByMinistry, Ministry } from "@/lib/universities";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DriPage() {
  const session = await getSession();

  // Redirigir si no hay sesión o rol incorrecto
  if (!session || (session.role !== "dri" && session.role !== "admin")) {
    redirect("/login");
  }

  const isDri = session.role === "dri";
  const ministry = session.ministry as Ministry;
  const ministryUnis = isDri && ministry ? getUniversitiesByMinistry(ministry) : [];

  // Server Action para refrescar los datos
  const refreshPageData = async () => {
    "use server";
    revalidatePath("/dri");
  };

  // Obtener estadísticas globales o por ministerio
  const statsConditions = [];
  const pendingConditions = [eq(users.status, "pending")];

  if (isDri && ministry) {
    statsConditions.push(inArray(graduates.university, ministryUnis));
    pendingConditions.push(inArray(graduates.university, ministryUnis));
  }

  const stats = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(graduates)
      .innerJoin(users, eq(graduates.userId, users.id))
      .where(and(eq(users.status, "approved"), ...statsConditions)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .innerJoin(graduates, eq(users.id, graduates.userId))
      .where(and(...pendingConditions)),
  ]);

  const totalGraduates = stats[0][0]?.count || 0;
  const globalPending = stats[1][0]?.count || 0;

  // Obtener solicitudes pendientes filtradas
  const pendingGraduates = await db
    .select({
      id: graduates.id,
      name: graduates.name,
      email: graduates.email,
      university: graduates.university,
      country: graduates.country,
      career: graduates.career,
      graduationYear: graduates.graduationYear,
      userId: users.id,
    })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(and(...pendingConditions))
    .orderBy(asc(graduates.createdAt));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isDri ? `Panel DRI - Ministerio ${ministry}` : "Panel DRI - Gestión Global"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isDri ? `Supervisión de registros de universidades del ${ministry}.` : "Supervisión de registros de todas las universidades."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Egresados {isDri ? ministry : ""}</h3>
            <p className="text-3xl font-bold text-[#003f8f]">{totalGraduates}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Solicitudes {isDri ? "del Ministerio" : "Globales"} Pendientes</h3>
            <p className="text-3xl font-bold text-orange-600">{globalPending}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📋</span> Solicitudes Pendientes de Aprobación
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Egresado</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Universidad</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Carrera / Año</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingGraduates.length > 0 ? (
                  pendingGraduates.map((grad) => (
                    <tr key={grad.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
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
                        <p className="text-xs text-gray-500">{grad.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{grad.country}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{grad.university}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{grad.career}</p>
                        <p className="text-xs text-gray-500">Graduado en {grad.graduationYear}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <UniversityApprovalButtons
                            graduateId={grad.id}
                            userId={grad.userId}
                            onRefresh={refreshPageData}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No hay solicitudes pendientes en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
