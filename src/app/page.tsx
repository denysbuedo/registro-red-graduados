import Link from "next/link";
import { db } from "@/db";
import { graduates, adminPosts, userPosts } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { AdminPostCard } from "@/components/AdminPostCard";
import { CreatePost } from "@/components/CreatePost";
import { UserPostCard } from "@/components/UserPostCard";
import { checkAndSendEventNotifications } from "@/lib/event-notifications";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Check and send event notifications
  await checkAndSendEventNotifications();

  const session = await getSession();
  const isLoggedIn = !!session;

  const stats = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(graduates),
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

  const recentGraduates = await db
    .select()
    .from(graduates)
    .orderBy(desc(graduates.createdAt))
    .limit(6);

  // Get posts for logged-in users
  let adminPostsData = [];
  let userPostsData = [];
  let userGraduateId = null;

  if (isLoggedIn) {
    const userGraduate = await db
      .select({ graduateId: graduates.id })
      .from(graduates)
      .where(eq(graduates.userId, session.id))
      .limit(1);
    userGraduateId = userGraduate[0]?.graduateId || null;

    adminPostsData = await db
      .select({
        id: adminPosts.id,
        title: adminPosts.title,
        content: adminPosts.content,
        imageUrl: adminPosts.imageUrl,
        authorName: adminPosts.authorName,
        createdAt: adminPosts.createdAt,
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

  // ============================================
  // HOME PARA USUARIOS LOGUEADOS
  // ============================================
  if (isLoggedIn) {
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
                  <Link href="/conexiones" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">🤝 Conexiones</Link>
                  {userGraduateId && (
                    <Link href={`/egresados/${userGraduateId}`} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">👤 Mi Perfil</Link>
                  )}
                  <Link href="/eventos" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">📅 Eventos</Link>
                  <Link href="/comunidades" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">👥 Comunidades</Link>
                  {session?.role === 'admin' && (
                    <Link href="/admin" className="block px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">🛡️ Panel Admin</Link>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Create Post */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CreatePost />
              </div>

              {/* Activity Feed */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Feed de Actividad</h2>
                {userPostsData.length > 0 ? (
                  <div className="space-y-4">
                    {userPostsData.map((post) => (
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

              {/* Admin News */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Noticias</h2>
                  {session?.role === 'admin' && (
                    <Link href="/admin/posts/new" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                      + Nueva Noticia
                    </Link>
                  )}
                </div>
                {adminPostsData.length > 0 ? (
                  <div className="grid gap-6">
                    {adminPostsData.map((post) => (
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
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-gray-500">Sin noticias por el momento</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // HOME PÚBLICO
  // ============================================
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#003f8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Red de Egresados Internacionales de la
              <span className="block mt-2">Educación Superior Cubana</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
              Conecta con profesionales extranjeros que se formaron en universidades cubanas. Descubre, comparte y crece junto a tu red.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-3.5 bg-white text-[#003f8f] hover:bg-gray-100 rounded-xl font-semibold text-base transition-colors shadow-lg">
                Unirse a la Red
              </Link>
              <Link href="/directorio" className="px-8 py-3.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-base transition-colors border border-white/30">
                Explorar Directorio
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Egresados", value: totalGraduates },
              { label: "Países", value: countriesResult.length },
              { label: "Universidades", value: 15 },
              { label: "Años", value: 60 },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Qué ofrece nuestra red?</h2>
          <div className="w-16 h-1 bg-[#003f8f] mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Conecta con Egresados", desc: "Encuentra compañeros de universidad y amplía tu red profesional.", emoji: "👥" },
            { title: "Ciencia e Investigación", desc: "Comparte investigaciones, colaboraciones científicas y proyectos académicos.", emoji: "🔬" },
            { title: "Alcance Global", desc: "Profesionales en más de 40 países creando lazos de conocimiento.", emoji: "🌍" },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
