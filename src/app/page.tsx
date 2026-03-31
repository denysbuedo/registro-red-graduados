import Link from "next/link";
import { db } from "@/db";
import { graduates, posts, connections } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const stats = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(graduates),
    db
      .select({ count: sql<number>`count(*)` })
      .from(connections)
      .where(eq(connections.status, "accepted")),
    db.select({ count: sql<number>`count(*)` }).from(posts),
  ]);

  const totalGraduates = stats[0][0]?.count || 0;
  const totalConnections = stats[1][0]?.count || 0;
  const totalPosts = stats[2][0]?.count || 0;

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
    .orderBy(graduates.createdAt)
    .limit(6);

  const recentPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      graduateName: graduates.name,
      graduatePhoto: graduates.photoUrl,
      graduateCountry: graduates.country,
    })
    .from(posts)
    .innerJoin(graduates, eq(posts.graduateId, graduates.id))
    .orderBy(posts.createdAt)
    .limit(5);

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-neutral-900 to-blue-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Red Internacional de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400">
                {" "}
                Egresados Cubanos
              </span>
            </h1>
            <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
              Conecta con profesionales que compartieron la experiencia de
              formarse en la educación superior cubana. Descubre, comparte y
              crece junto a tu red de egresados en todo el mundo.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/egresados/registro"
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-base transition-colors shadow-lg shadow-red-600/20"
              >
                Unirse a la Red
              </Link>
              <Link
                href="/directorio"
                className="px-8 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold text-base transition-colors border border-neutral-700"
              >
                Explorar Directorio
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Egresados"
              value={totalGraduates}
              icon="graduation"
            />
            <StatCard
              label="Conexiones"
              value={totalConnections}
              icon="network"
            />
            <StatCard
              label="Publicaciones"
              value={totalPosts}
              icon="posts"
            />
            <StatCard
              label="Países"
              value={countriesResult.length}
              icon="globe"
            />
          </div>
        </div>
      </section>

      {countriesResult.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-white mb-8">
            Distribución por Países
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {countriesResult.map((c) => (
              <div
                key={c.country}
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-white">
                  {c.count}
                </div>
                <div className="text-sm text-neutral-400 mt-1 truncate">
                  {c.country}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentGraduates.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              Egresados Recientes
            </h2>
            <Link
              href="/directorio"
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentGraduates.map((g) => (
              <Link
                key={g.id}
                href={`/egresados/${g.id}`}
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-5 hover:border-neutral-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                    {g.photoUrl ? (
                      <img
                        src={g.photoUrl}
                        alt={g.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      g.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {g.name}
                    </h3>
                    <p className="text-neutral-400 text-sm truncate">
                      {g.currentProfession}
                    </p>
                    <p className="text-neutral-500 text-xs truncate">
                      {g.country} · {g.university}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-8">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {post.graduateName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">
                        {post.graduateName}
                      </span>
                      <span className="text-neutral-500 text-xs">
                        {post.graduateCountry}
                      </span>
                    </div>
                    <p className="text-neutral-300 mt-2 text-sm leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {totalGraduates === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-2xl p-12">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Se el primero en unirte
            </h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Aún no hay egresados registrados. Sé el primero en formar parte de
              esta red internacional de profesionales cubanos.
            </p>
            <Link
              href="/egresados/registro"
              className="inline-block px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
            >
              Registrarme Ahora
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    graduation: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
    network: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    posts: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    globe: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 text-center">
      <div className="flex justify-center text-red-400 mb-2">{iconMap[icon]}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
