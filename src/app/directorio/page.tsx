import { db } from "@/db";
import { graduates } from "@/db/schema";
import { sql } from "drizzle-orm";
import { GraduateCard } from "@/components/GraduateCard";

export const dynamic = "force-dynamic";

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const country = params.country || "";
  const university = params.university || "";
  const career = params.career || "";
  const yearFrom = params.yearFrom || "";
  const yearTo = params.yearTo || "";

  let query = db.select().from(graduates);
  const conditions = [];

  if (search) {
    conditions.push(
      sql`(${graduates.name} LIKE ${"%" + search + "%"} OR ${graduates.currentProfession} LIKE ${"%" + search + "%"} OR ${graduates.bio} LIKE ${"%" + search + "%"})`
    );
  }
  if (country) conditions.push(sql`${graduates.country} = ${country}`);
  if (university)
    conditions.push(sql`${graduates.university} = ${university}`);
  if (career) conditions.push(sql`${graduates.career} = ${career}`);
  if (yearFrom)
    conditions.push(
      sql`${graduates.graduationYear} >= ${parseInt(yearFrom)}`
    );
  if (yearTo)
    conditions.push(
      sql`${graduates.graduationYear} <= ${parseInt(yearTo)}`
    );

  const allGraduates =
    conditions.length > 0
      ? await query.where(sql.join(conditions, sql` AND `)).orderBy(graduates.name)
      : await query.orderBy(graduates.name);

  const countriesResult = await db
    .selectDistinct({ country: graduates.country })
    .from(graduates)
    .orderBy(graduates.country);

  const universitiesResult = await db
    .selectDistinct({ university: graduates.university })
    .from(graduates)
    .orderBy(graduates.university);

  const careersResult = await db
    .selectDistinct({ career: graduates.career })
    .from(graduates)
    .orderBy(graduates.career);

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Directorio</h1>
          <p className="text-neutral-400 mt-1">
            Busca y filtra egresados por diferentes criterios
          </p>
        </div>

        <form className="mb-8 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre, profesión o biografía..."
              className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              Buscar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <select
              name="country"
              defaultValue={country}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="">Todos los países</option>
              {countriesResult.map((c) => (
                <option key={c.country} value={c.country}>
                  {c.country}
                </option>
              ))}
            </select>

            <select
              name="university"
              defaultValue={university}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="">Todas las universidades</option>
              {universitiesResult.map((u) => (
                <option key={u.university} value={u.university}>
                  {u.university}
                </option>
              ))}
            </select>

            <select
              name="career"
              defaultValue={career}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="">Todas las carreras</option>
              {careersResult.map((c) => (
                <option key={c.career} value={c.career}>
                  {c.career}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="yearFrom"
              defaultValue={yearFrom}
              placeholder="Año desde"
              min={1960}
              max={2030}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            />

            <input
              type="number"
              name="yearTo"
              defaultValue={yearTo}
              placeholder="Año hasta"
              min={1960}
              max={2030}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {(search || country || university || career || yearFrom || yearTo) && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">
                {allGraduates.length} resultado{allGraduates.length !== 1 && "s"}
              </span>
              <a
                href="/directorio"
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Limpiar filtros
              </a>
            </div>
          )}
        </form>

        {allGraduates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGraduates.map((g) => (
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg">
              No se encontraron egresados con los filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
