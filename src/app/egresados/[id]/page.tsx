import { db } from "@/db";
import { graduates, connections, posts } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GraduateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const graduateId = parseInt(id);

  const graduate = await db
    .select()
    .from(graduates)
    .where(eq(graduates.id, graduateId));

  if (!graduate.length) {
    notFound();
  }

  const g = graduate[0];

  const acceptedConnections = await db
    .select()
    .from(connections)
    .where(
      and(
        or(
          eq(connections.senderId, graduateId),
          eq(connections.receiverId, graduateId)
        ),
        eq(connections.status, "accepted")
      )
    );

  const graduatePosts = await db
    .select()
    .from(posts)
    .where(eq(posts.graduateId, graduateId))
    .orderBy(posts.createdAt);

  const initials = g.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-900/40 to-blue-900/40 relative" />
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-neutral-800 shrink-0 overflow-hidden">
                {g.photoUrl ? (
                  <img
                    src={g.photoUrl}
                    alt={g.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white">{g.name}</h1>
                <p className="text-neutral-400">
                  {g.currentProfession}
                  {g.currentCompany && ` en ${g.currentCompany}`}
                </p>
              </div>
              <Link
                href={`/egresados/registro?edit=${g.id}`}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Editar Perfil
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {g.bio && (
              <Card title="Sobre mí">
                <p className="text-neutral-300 text-sm leading-relaxed">
                  {g.bio}
                </p>
              </Card>
            )}

            <Card title="Formación en Cuba">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Universidad" value={g.university} />
                <InfoItem label="Carrera" value={g.career} />
                <InfoItem
                  label="Año de Graduación"
                  value={String(g.graduationYear)}
                />
              </div>
            </Card>

            <Card title="Situación Profesional">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Profesión" value={g.currentProfession} />
                {g.currentCompany && (
                  <InfoItem label="Empresa" value={g.currentCompany} />
                )}
              </div>
            </Card>

            {g.skills && (
              <Card title="Habilidades">
                <div className="flex flex-wrap gap-2">
                  {g.skills.split(",").map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-neutral-700/50 text-neutral-300 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {g.languages && (
              <Card title="Idiomas">
                <div className="flex flex-wrap gap-2">
                  {g.languages.split(",").map((lang, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm"
                    >
                      {lang.trim()}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {g.interests && (
              <Card title="Intereses">
                <div className="flex flex-wrap gap-2">
                  {g.interests.split(",").map((interest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm"
                    >
                      {interest.trim()}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {graduatePosts.length > 0 && (
              <Card title="Publicaciones">
                <div className="space-y-4">
                  {graduatePosts.map((post) => (
                    <div
                      key={post.id}
                      className="pb-4 border-b border-neutral-700/50 last:border-0 last:pb-0"
                    >
                      <p className="text-neutral-300 text-sm">{post.content}</p>
                      <p className="text-neutral-500 text-xs mt-2">
                        {new Date(post.createdAt as unknown as string | number).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card title="Información de Contacto">
              <div className="space-y-3">
                <ContactItem
                  icon="email"
                  label={g.email}
                  href={`mailto:${g.email}`}
                />
                {g.phone && (
                  <ContactItem
                    icon="phone"
                    label={g.phone}
                    href={`tel:${g.phone}`}
                  />
                )}
                <ContactItem icon="location" label={`${g.city ? g.city + ", " : ""}${g.country}`} />
                {g.linkedin && (
                  <ContactItem
                    icon="linkedin"
                    label="LinkedIn"
                    href={g.linkedin}
                  />
                )}
                {g.website && (
                  <ContactItem
                    icon="web"
                    label="Sitio Web"
                    href={g.website}
                  />
                )}
              </div>
            </Card>

            <Card title="Estadísticas">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Conexiones</span>
                  <span className="text-white font-semibold">
                    {acceptedConnections.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Publicaciones</span>
                  <span className="text-white font-semibold">
                    {graduatePosts.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-xl p-5">
      <h2 className="text-base font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-neutral-500 text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="text-neutral-200 text-sm mt-0.5">{value}</p>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  href,
}: {
  icon: string;
  label: string;
  href?: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    email: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    phone: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    location: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    web: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  };

  const content = (
    <div className="flex items-center gap-2.5 text-neutral-300 text-sm hover:text-white transition-colors">
      <span className="text-neutral-500">{icons[icon]}</span>
      <span className="truncate">{label}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
