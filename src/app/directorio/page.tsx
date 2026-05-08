import { db } from "@/db";
import { graduates, users } from "@/db/schema";
import { sql, eq, and, like, or, desc, inArray, isNotNull } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduateCard } from "@/components/GraduateCard";
import { APP_CONFIG } from "@/lib/config";
import { getUniversitiesByMinistry, Ministry } from "@/lib/universities";
import { graduatePostgraduates } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/directorio");
  }

  if (session.status === "pending") {
    redirect("/pendiente");
  }

  if (APP_CONFIG.isLightVersion && session.role === 'user') {
    redirect("/");
  }

  const params = await searchParams;
  const search = params.search || "";
  const country = params.country || "";
  const university = params.university || "";
  const career = params.career || "";
  const yearFrom = params.yearFrom || "";
  const yearTo = params.yearTo || "";

  const PAGE_SIZE = 25;
  const page = parseInt(params.page || "1");
  const offset = (page - 1) * PAGE_SIZE;

  let queryBuilder = db
    .select({
      id: graduates.id,
      name: graduates.name,
      country: graduates.country,
      university: graduates.university,
      career: graduates.career,
      graduationYear: graduates.graduationYear,
      currentProfession: graduates.currentProfession,
      currentCompany: graduates.currentCompany,
      photoUrl: graduates.photoUrl,
    })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(eq(users.status, "approved"))
    .$dynamic();

  const conditions = [];

  if (session.role === "institution" && session.institutionName) {
    conditions.push(eq(graduates.university, session.institutionName));
  }

  if (session.role === "dri" && session.ministry) {
    const unis = getUniversitiesByMinistry(session.ministry as Ministry);
    if (unis.length > 0) {
      conditions.push(inArray(graduates.university, unis));
    }
  }

  if (search) {
    conditions.push(like(graduates.name, `%${search}%`));
  }
  
  if (country) conditions.push(eq(graduates.country, country));
  if (university && session.role !== "institution") {
    conditions.push(eq(graduates.university, university));
  }
  if (career) conditions.push(eq(graduates.career, career));
  
  const currentYear = new Date().getFullYear();
  if (yearFrom && parseInt(yearFrom) > 1900) {
    conditions.push(sql`${graduates.graduationYear} >= ${parseInt(yearFrom)}`);
  }
  if (yearTo && parseInt(yearTo) > 0 && parseInt(yearTo) <= currentYear + 10) {
    conditions.push(sql`${graduates.graduationYear} <= ${parseInt(yearTo)}`);
  }

  if (conditions.length > 0) {
    queryBuilder = queryBuilder.where(and(...conditions));
  }

  // Clonar para contar el total antes de paginar
  const totalResultsQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(and(eq(users.status, "approved"), ...conditions));
  
  const totalResults = (await totalResultsQuery)[0].count;
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  const allGraduates = await queryBuilder
    .orderBy(desc(graduates.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // Fetch postgraduates for these graduates
  const graduateIds = allGraduates.map(g => g.id);
  const allPostgrads = graduateIds.length > 0 
    ? await db.select().from(graduatePostgraduates).where(inArray(graduatePostgraduates.graduateId, graduateIds)) 
    : [];

  // Group postgrads by graduateId
  const postgradsByGraduate = allPostgrads.reduce((acc: any, pg) => {
    if (!acc[pg.graduateId]) acc[pg.graduateId] = [];
    acc[pg.graduateId].push(pg);
    return acc;
  }, {});

  const countriesResult = await db
    .selectDistinct({ country: graduates.country })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(and(
      eq(users.status, "approved"),
      session.role === "dri" && session.ministry 
        ? inArray(graduates.university, getUniversitiesByMinistry(session.ministry as Ministry))
        : sql`1=1`
    ))
    .orderBy(graduates.country);

  const universitiesResult = await db
    .selectDistinct({ university: graduates.university })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(and(
      eq(users.status, "approved"),
      isNotNull(graduates.university),
      session.role === "dri" && session.ministry 
        ? inArray(graduates.university, getUniversitiesByMinistry(session.ministry as Ministry))
        : sql`1=1`
    ))
    .orderBy(graduates.university);

  const careersResult = await db
    .selectDistinct({ career: graduates.career })
    .from(graduates)
    .innerJoin(users, eq(graduates.userId, users.id))
    .where(and(
      eq(users.status, "approved"),
      isNotNull(graduates.career),
      session.role === "dri" && session.ministry 
        ? inArray(graduates.university, getUniversitiesByMinistry(session.ministry as Ministry))
        : sql`1=1`
    ))
    .orderBy(graduates.career);

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Hero Header */}
      <div className="bg-[#003f8f] relative overflow-hidden pt-16 pb-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4),transparent_50%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                {session.role === "institution" ? `Graduados de ${session.institutionName}` : "Directorio Global"}
              </h1>
              <p className="text-blue-100 text-lg font-medium max-w-2xl">
                Conecta con profesionales graduados en Cuba que hoy transforman el mundo. 
                Explora por país, universidad o especialidad.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <p className="text-white text-2xl font-bold">{allGraduates.length}</p>
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Egresados Registrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 p-6 sm:p-8">
          <form className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Buscar por nombre del egresado..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-semibold placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="px-10 py-4 bg-[#003f8f] hover:bg-[#002e6a] text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                Filtrar Resultados
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SelectFilter icon={<GlobeIcon />} name="country" defaultValue={country} options={countriesResult.map(c => c.country)} label="País de Residencia" />
              {session.role !== "institution" && (
                <SelectFilter icon={<UniversityIcon />} name="university" defaultValue={university} options={universitiesResult.map(u => u.university)} label="Universidad Cubana" />
              )}
              <SelectFilter icon={<AcademicIcon />} name="career" defaultValue={career} options={careersResult.map(c => c.career)} label="Especialidad / Carrera" />
              <div className="flex gap-2">
                <input
                  type="number"
                  name="yearFrom"
                  defaultValue={yearFrom}
                  placeholder="Año inicial (ej. 1990)"
                  min="1960"
                  max={currentYear + 10}
                  className="w-1/2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold text-xs focus:bg-white focus:border-blue-400 transition-all outline-none"
                />
                <input
                  type="number"
                  name="yearTo"
                  defaultValue={yearTo}
                  placeholder="Año final (ej. 2024)"
                  min="1960"
                  max={currentYear + 10}
                  className="w-1/2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold text-xs focus:bg-white focus:border-blue-400 transition-all outline-none"
                />
              </div>
            </div>

            {(search || country || university || career || yearFrom || yearTo) && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <p className="text-sm text-gray-500 font-bold">
                  Mostrando <span className="text-[#003f8f]">{offset + 1}-{Math.min(offset + allGraduates.length, totalResults)}</span> de <span className="text-[#003f8f]">{totalResults}</span> egresados
                </p>
                <Link
                  href="/directorio"
                  className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Limpiar todos los filtros
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Results Grid */}
        <div className="mt-12">
          {allGraduates.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {allGraduates.map((g) => {
                  const graduatePostgrads = postgradsByGraduate[g.id] || [];
                  const firstPostgrad = graduatePostgrads[0] || null;

                  return (
                    <GraduateCard
                      key={g.id}
                      id={g.id}
                      name={g.name}
                      country={g.country}
                      university={g.university}
                      career={g.career}
                      graduationYear={g.graduationYear}
                      currentProfession={g.currentProfession}
                      currentCompany={g.currentCompany}
                      photoUrl={g.photoUrl}
                      postgraduate={firstPostgrad}
                    />
                  );
                })}
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-6">
                  {page > 1 ? (
                    <Link
                      href={`/directorio?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined)), page: (page - 1).toString() })}`}
                      className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Anterior
                    </Link>
                  ) : (
                    <div className="px-8 py-3 bg-gray-50 text-gray-300 rounded-2xl font-bold border border-gray-100 cursor-not-allowed">Anterior</div>
                  )}

                  <span className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-2 rounded-lg">Página {page} de {totalPages}</span>

                  {page < totalPages ? (
                    <Link
                      href={`/directorio?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined)), page: (page + 1).toString() })}`}
                      className="px-8 py-3 bg-[#003f8f] text-white rounded-2xl font-bold hover:bg-[#002e6a] transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                      Siguiente
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ) : (
                    <div className="px-8 py-3 bg-gray-50 text-gray-300 rounded-2xl font-bold border border-gray-100 cursor-not-allowed">Siguiente</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-xl shadow-slate-200/50">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Sin coincidencias</h3>
              <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                No hemos encontrado egresados con esos criterios. Prueba ampliando tu búsqueda o eliminando algunos filtros.
              </p>
              <Link
                href="/directorio"
                className="inline-flex px-8 py-4 bg-[#003f8f] text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                Reiniciar Directorio
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SelectFilter({ icon, name, defaultValue, options, label }: any) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold text-xs focus:bg-white focus:border-blue-400 transition-all outline-none appearance-none cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function GlobeIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
}

function UniversityIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
}

function AcademicIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
}
