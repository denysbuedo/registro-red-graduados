import Link from "next/link";
import { db } from "@/db";
import { graduates, adminPosts, userPosts, users } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { AdminPostCard } from "@/components/AdminPostCard";
import { CreatePost } from "@/components/CreatePost";
import { UserPostCard } from "@/components/UserPostCard";
import { LoginForm } from "@/components/LoginForm";
import { PublicLanding } from "@/components/PublicLanding";
import { checkAndSendEventNotifications } from "@/lib/event-notifications";
import { redirect } from "next/navigation";
import { APP_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  
  // 1. PRIORIDAD: Redirigir usuarios pendientes a la página de espera (Solo si NO están en Home o Directorio)
  // En versión Light permitimos ver la landing aunque estén pendientes
  if (session?.status === "pending" && !APP_CONFIG.isLightVersion) {
    redirect("/pendiente");
  }

  // Si el usuario es de una institución, redirigir directo a sus solicitudes
  if (session?.role === "institution") {
    redirect("/universidad");
  }

  // Check and send event notifications
  if (session?.status === "approved" && APP_CONFIG.features.events) {
    await checkAndSendEventNotifications();
  }
  
  const isLoggedIn = !!session;

  const stats = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(graduates)
      .innerJoin(users, eq(graduates.userId, users.id))
      .where(eq(users.status, "approved")),
  ]);

  const totalGraduates = stats[0][0]?.count || 0;

  const countriesResult = await db
    .select({
      country: graduates.country,
      count: sql<number>`count(*)`,
    })
    .from(graduates)
    .groupBy(graduates.country)
    .orderBy(sql`count(*) DESC`)
    .limit(6);

  // Get posts for logged-in users (Solo si NO es versión Light)
  let adminPostsData: any[] = [];
  let userPostsData: any[] = [];
  let userGraduateId: number | null = null;

  if (isLoggedIn) {
    const userGraduate = await db
      .select({ graduateId: graduates.id })
      .from(graduates)
      .where(eq(graduates.userId, session.id))
      .limit(1);
    userGraduateId = userGraduate[0]?.graduateId || null;

    if (!APP_CONFIG.isLightVersion) {
      adminPostsData = await db
        .select({
          id: adminPosts.id,
          title: adminPosts.title,
          content: adminPosts.content,
          imageUrl: adminPosts.imageUrl,
          authorName: adminPosts.authorName,
          createdAt: adminPosts.createdAt,
          pinnedUntil: adminPosts.pinnedUntil,
        })
        .from(adminPosts)
        .orderBy(desc(adminPosts.createdAt))
        .limit(10);

      userPostsData = await db
        .select({
          id: userPosts.id,
          content: userPosts.content,
          imageUrl: userPosts.imageUrl,
          likes: userPosts.likes,
          commentsCount: userPosts.commentsCount,
          createdAt: userPosts.createdAt,
          graduateId: graduates.id,
          graduateName: graduates.name,
          graduatePhoto: graduates.photoUrl,
          graduateProfession: graduates.currentProfession,
          graduateCountry: graduates.country,
        })
        .from(userPosts)
        .leftJoin(graduates, eq(userPosts.graduateId, graduates.id))
        .orderBy(desc(userPosts.createdAt))
        .limit(20);
    }
  }

  // eslint-disable-next-line react-hooks/purity
  const nowSec = Math.floor(Date.now() / 1000);

  // ============================================
  // HOME PARA USUARIOS LOGUEADOS
  // ============================================
  if (isLoggedIn) {
    // Si es versión Light y es un graduado, redirigir directamente a su perfil
    if (APP_CONFIG.isLightVersion && session?.role === 'user' && userGraduateId) {
      redirect(`/egresados/${userGraduateId}`);
    }

    // Si es versión Light, mostramos un dashboard minimalista para roles administrativos
    if (APP_CONFIG.isLightVersion) {
      return (
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#003f8f] flex items-center justify-center text-white text-2xl font-bold">
                  {session?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">¡Hola, {session?.username}!</h1>
                  <p className="text-gray-500">Bienvenido a la Red de Graduados Internacionales de la Educación Superior.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opción para Instituciones / DRI */}
                {(session?.role === 'institution' || session?.role === 'dri' || session?.role === 'admin') && (
                  <Link href={(session.role === 'dri' || session.role === 'admin') ? "/dri" : "/universidad"} className="group p-6 border-2 border-purple-50 bg-purple-50/50 rounded-2xl hover:border-purple-500 hover:bg-white transition-all">
                    <span className="text-3xl block mb-3">📋</span>
                    <h3 className="text-lg font-bold text-purple-900 group-hover:text-purple-600">Gestión de Solicitudes</h3>
                    <p className="text-sm text-purple-700 mt-1">Revisar y aprobar nuevos registros de egresados.</p>
                  </Link>
                )}

                {session?.role === 'admin' && (
                  <Link href="/admin" className="group p-6 border-2 border-gray-100 bg-gray-50 rounded-2xl hover:border-gray-500 hover:bg-white transition-all">
                    <span className="text-3xl block mb-3">🛡️</span>
                    <h3 className="text-lg font-bold text-gray-900">Administración</h3>
                    <p className="text-sm text-gray-600 mt-1">Configuración avanzada y gestión global del sistema.</p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      );
    }

    const pinned = adminPostsData.filter((p) => {
      if (!p.pinnedUntil) return false;
      return p.pinnedUntil >= nowSec;
    });
    const regular = adminPostsData.filter((p) => {
      if (!p.pinnedUntil) return true;
      return p.pinnedUntil < nowSec;
    });

    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-6">
              {/* Welcome Card */}
              <div className="bg-[#003f8f] rounded-xl p-6 text-white">
                <h2 className="text-lg font-bold mb-1">¡Hola, {session?.username}!</h2>
                <p className="text-sm text-blue-200">Red de Egresados Internacionales</p>
              </div>

              {/* Stats */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Egresados</span>
                    <span className="text-xl font-bold text-[#003f8f]">{totalGraduates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Países</span>
                    <span className="text-xl font-bold text-[#003f8f]">{countriesResult.length}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Accesos Rápidos</h3>
                <div className="space-y-1">
                  <Link href="/directorio" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">📋 Directorio</Link>
                  {APP_CONFIG.features.connections && (
                    <Link href="/conexiones" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">🤝 Conexiones</Link>
                  )}
                  {userGraduateId && APP_CONFIG.features.individualProfiles && (
                    <Link href={`/egresados/${userGraduateId}`} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">👤 Mi Perfil</Link>
                  )}
                  {APP_CONFIG.features.events && (
                    <Link href="/eventos" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">📅 Eventos</Link>
                  )}
                  {APP_CONFIG.features.groups && (
                    <Link href="/comunidades" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">👥 Comunidades</Link>
                  )}
                  {session?.role === 'admin' && (
                    <Link href="/admin" className="block px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">🛡️ Panel Admin</Link>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {APP_CONFIG.isLightVersion ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Panel de Gestión Institucional</h2>
                  <p className="text-gray-600 mb-6">
                    Bienvenido al portal de administración. Desde aquí puede gestionar los registros de egresados y consultar el directorio institucional.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/directorio" className="p-4 border border-blue-100 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <span className="text-2xl block mb-2">📋</span>
                      <span className="font-semibold text-blue-900">Directorio</span>
                      <p className="text-sm text-blue-700 mt-1">Consultar egresados aprobados</p>
                    </Link>
                    {session?.role === 'admin' && (
                      <Link href="/admin" className="p-4 border border-purple-100 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                        <span className="text-2xl block mb-2">🛡️</span>
                        <span className="font-semibold text-purple-900">Panel Admin</span>
                        <p className="text-sm text-purple-700 mt-1">Gestionar usuarios y aprobaciones</p>
                      </Link>
                    )}
                    {session?.role === 'institution' && (
                       <Link href="/universidad" className="p-4 border border-yellow-100 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                        <span className="text-2xl block mb-2">🏛️</span>
                        <span className="font-semibold text-yellow-700">Gestión Institucional</span>
                        <p className="text-sm text-yellow-700 mt-1">Revisar solicitudes y egresados</p>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Create Post */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <CreatePost />
                  </div>

                  {/* Pinned News */}
                  {pinned.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Noticias Destacadas
                      </h2>
                      <div className="space-y-4">
                        {pinned.map((post: any) => (
                          <div key={post.id} className="border-2 border-red-200 bg-red-50/30 rounded-xl overflow-hidden">
                            <AdminPostCard
                              key={post.id}
                              id={post.id}
                              title={post.title}
                              content={post.content}
                              imageUrl={post.imageUrl}
                              authorName={post.authorName}
                              createdAt={post.createdAt}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity Feed */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Feed de Actividad</h2>
                    {userPostsData.length > 0 ? (
                      <div className="space-y-4">
                        {userPostsData.map((post: any) => (
                          <UserPostCard
                            key={post.id}
                            id={post.id}
                            content={post.content}
                            imageUrl={post.imageUrl}
                            likes={post.likes}
                            commentsCount={post.commentsCount}
                            createdAt={post.createdAt}
                            graduateId={post.graduateId}
                            graduateName={post.graduateName}
                            graduatePhoto={post.graduatePhoto}
                            graduateProfession={post.graduateProfession}
                            graduateCountry={post.graduateCountry}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                        <p className="text-gray-500">Sé el primero en publicar</p>
                      </div>
                    )}
                  </div>

                  {/* Regular News */}
                  {regular.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Noticias</h2>
                        {session?.role === 'admin' && (
                          <Link href="/admin/posts/new" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                            + Nueva Noticia
                          </Link>
                        )}
                      </div>
                      <div className="grid gap-6">
                        {regular.map((post: any) => (
                          <AdminPostCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            content={post.content}
                            imageUrl={post.imageUrl}
                            authorName={post.authorName}
                            createdAt={post.createdAt}
                          />
                        ))}
                      </div>
                      <div className="text-center mt-4">
                        <Link href="/noticias" className="text-[#003f8f] hover:underline text-sm font-medium">
                          Ver todas las noticias →
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // HOME PÚBLICO - Rediseñado (Componente reutilizable)
  // ============================================
  return <PublicLanding />;
}
