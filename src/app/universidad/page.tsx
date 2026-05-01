import { db } from "@/db";
import { users, graduates } from "@/db/schema";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { PendingActions } from "@/components/PendingActions";

export const dynamic = "force-dynamic";

export default async function UniversidadPage() {
  const session = await getSession();

  // Solo usuarios institution pueden ver esta página
  if (!session) redirect("/login?redirect=/universidad");
  if (session.role !== "institution") redirect("/");

  const institutionName = session.institutionName;

  if (!institutionName) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sin universidad asignada</h2>
          <p className="text-gray-600 mb-4">Contacta al administrador para asignar tu universidad.</p>
        </div>
      </main>
    );
  }

  // Estadísticas
  const [totalResult, pendingResult, approvedResult, rejectedResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(graduates).where(eq(graduates.university, institutionName)),
    db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.pendingUniversity} = ${institutionName}`),
    db.select({ count: sql<number>`count(*)` }).from(users).where(
      sql`${users.pendingUniversity} = ${institutionName} AND ${users.status} = 'approved'`
    ),
    db.select({ count: sql<number>`count(*)` }).from(users).where(
      sql`${users.pendingUniversity} = ${institutionName} AND ${users.status} = 'rejected'`
    ),
  ]);

  const totalGraduates = totalResult[0]?.count || 0;
  const totalUsers = pendingResult[0]?.count || 0;
  const approvedUsers = approvedResult[0]?.count || 0;
  const rejectedUsers = rejectedResult[0]?.count || 0;
  const pendingUsers = totalUsers - approvedUsers - rejectedUsers;

  // Usuarios pendientes de aprobación (registrados con esta universidad)
  const pendingList = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(sql`${users.pendingUniversity} = ${institutionName} AND ${users.status} = 'pending'`)
    .orderBy(users.createdAt);

  // Egresados activos de esta universidad
  const activeGraduates = await db
    .select({
      id: graduates.id,
      name: graduates.name,
      country: graduates.country,
      career: graduates.career,
      graduationYear: graduates.graduationYear,
      currentProfession: graduates.currentProfession,
      photoUrl: graduates.photoUrl,
    })
    .from(graduates)
    .where(eq(graduates.university, institutionName))
    .orderBy(graduates.createdAt)
    .limit(20);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏛️ {institutionName}</h1>
          <p className="text-gray-600 mt-1">Panel de gestión de egresados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Egresados</div>
            <div className="text-3xl font-bold text-[#003f8f]">{totalGraduates}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Usuarios Activos</div>
            <div className="text-3xl font-bold text-green-600">{approvedUsers}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Pendientes</div>
            <div className="text-3xl font-bold text-yellow-600">{pendingUsers}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Rechazados</div>
            <div className="text-3xl font-bold text-red-600">{rejectedUsers}</div>
          </div>
        </div>

        {/* Pendientes de aprobación */}
        {pendingList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-yellow-600">⏳</span>
              Solicitudes Pendientes ({pendingList.length})
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingList.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-ES") : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PendingActions userId={user.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Egresados Activos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-green-600">👥</span>
            Egresados Activos ({activeGraduates.length})
          </h2>
          {activeGraduates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGraduates.map((g) => (
                <Link
                  key={g.id}
                  href={`/egresados/${g.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003f8f] to-[#0050b8] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {g.photoUrl ? (
                        <img src={g.photoUrl} alt={g.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        g.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{g.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{g.currentProfession}</p>
                      <p className="text-xs text-gray-400 truncate">{g.country} · {g.graduationYear}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500">Aún no hay egresados registrados para esta universidad</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
