import { db } from "@/db";
import { graduates, connections, users, userPosts } from "@/db/schema";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { eq, and, or, desc } from "drizzle-orm";
import Link from "next/link";
import { APP_CONFIG } from "@/lib/config";
import { EditProfileButton } from "@/components/EditProfileButton";

export const dynamic = "force-dynamic";

export default async function GraduateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const graduateId = parseInt(id);

  // Obtener datos del egresado
  const graduate = await db.query.graduates.findFirst({
    where: eq(graduates.id, graduateId),
    with: {
      postgraduates: true,
    },
  });

  if (!graduate) {
    notFound();
  }

  // Verificar permisos
  let canViewProfile = false;
  let isFriend = false;
  let myGraduateId: number | null = null;

  if (session) {
    // Obtener el graduateId del usuario logueado
    const userGraduate = await db
      .select({ graduateId: graduates.id })
      .from(graduates)
      .where(eq(graduates.userId, session.id))
      .limit(1);

    if (userGraduate.length > 0) {
      myGraduateId = userGraduate[0].graduateId;

      // Verificar si es el propio perfil (Siempre permitido)
      if (myGraduateId === graduateId) {
        canViewProfile = true;
        isFriend = true;
      } else if (!APP_CONFIG.isLightVersion) {
        // Verificar si son amigos (Solo en versión Full)
        const connection = await db
          .select()
          .from(connections)
          .where(
            and(
              or(
                and(
                  eq(connections.senderId, myGraduateId),
                  eq(connections.receiverId, graduateId)
                ),
                and(
                  eq(connections.senderId, graduateId),
                  eq(connections.receiverId, myGraduateId)
                )
              ),
              eq(connections.status, "accepted")
            )
          )
          .limit(1);

        if (connection.length > 0) {
          canViewProfile = true;
          isFriend = true;
        }
      }
    }
    
    // Roles administrativos siempre pueden ver perfiles
    if (session.role === "admin" || session.role === "institution" || session.role === "dri") {
      canViewProfile = true;
    }
  }

  // Si no puede ver el perfil, mostrar mensaje de privacidad premium
  if (!canViewProfile) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-2xl shadow-blue-500/10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Perfil Privado</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            La información de este graduado está protegida. Solo los usuarios autorizados o administradores pueden acceder a este perfil.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#003f8f] hover:bg-[#002e6a] text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20"
          >
            Volver al Inicio
          </Link>
        </div>
      </main>
    );
  }

  // Mostrar perfil completo con diseño Premium
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Section / Header */}
      <div className="relative">
        {/* Banner Dinámico */}
        <div className="h-64 sm:h-80 bg-gradient-to-r from-[#003f8f] via-[#0052bd] to-[#003f8f] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.4),transparent_50%)]"></div>
          </div>
        </div>

        {/* Floating Profile Card */}
        <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-blue-900/10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              {/* Avatar con Efecto */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl overflow-hidden flex items-center justify-center text-white font-bold text-3xl">
                  {graduate.photoUrl ? (
                    <img src={graduate.photoUrl} alt={graduate.name} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                  ) : (
                    graduate.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                  )}
                </div>
                {myGraduateId === graduateId && (
                  <div className="absolute bottom-2 right-2">
                    <EditProfileButton graduateId={graduate.id} />
                  </div>
                )}
              </div>

              {/* Información Principal */}
              <div className="flex-1 text-center md:text-left pt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    {graduate.name}
                  </h1>
                  <span className="inline-flex items-center px-4 py-1 bg-blue-50 text-[#003f8f] rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
                    Graduado
                  </span>
                </div>
                
                <p className="text-sm sm:text-base font-medium text-gray-600 mb-6 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-blue-600">{graduate.currentProfession}</span>
                  {graduate.currentCompany && <span className="text-gray-400">en <span className="text-gray-700">{graduate.currentCompany}</span></span>}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge icon={<LocationIcon />} text={graduate.country} color="blue" />
                  <Badge icon={<UniversityIcon />} text={graduate.university} color="indigo" />
                  <Badge icon={<CalendarIcon />} text={`Clase de ${graduate.graduationYear}`} color="slate" />
                </div>
              </div>

              {/* Acciones de Contacto */}
              <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                <a href={`mailto:${graduate.email}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#003f8f] text-white rounded-2xl font-bold hover:bg-[#002e6a] transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                  <EmailIcon className="w-5 h-5" />
                  Contactar
                </a>
                {graduate.linkedin && (
                  <a href={graduate.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                    <LinkedInIcon className="w-5 h-5 text-blue-600" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Contenido */}
      <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Lateral - Información Rápida */}
        <aside className="space-y-8">
          {/* Datos Personales */}
          <SectionCard title="Datos de Identidad" icon={<IdIcon />}>
            <div className="space-y-4">
              <InfoItem label="País de Origen" value={graduate.birthCountry} />
              <InfoItem label="Fecha de Nacimiento" value={graduate.birthDate} />
              {graduate.passport && <InfoItem label="Número de Pasaporte" value={graduate.passport} />}
              <InfoItem label="Teléfono / WhatsApp" value={graduate.phone} />
            </div>
          </SectionCard>

          {/* Social / Web */}
          {(graduate.linkedin || graduate.website) && (
            <SectionCard title="Presencia Online" icon={<GlobeIcon />}>
              <div className="space-y-4">
                {graduate.linkedin && <SocialLink icon={<LinkedInIcon />} label="LinkedIn Professional" href={graduate.linkedin} />}
                {graduate.website && <SocialLink icon={<GlobeIcon />} label="Sitio Web Personal" href={graduate.website} />}
              </div>
            </SectionCard>
          )}

          {/* Idiomas */}
          {graduate.languages && (
            <SectionCard title="Idiomas" icon={<TranslateIcon />}>
              <div className="flex flex-wrap gap-2">
                {graduate.languages.split(",").map((lang, i) => (
                  <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold border border-indigo-100">
                    {lang.trim()}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}
        </aside>

        {/* Columna Principal - Trayectoria */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Biografía / Sobre mí */}
          {graduate.bio && (
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-xl shadow-slate-200/50">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <StarIcon />
                </div>
                Sobre mí
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed italic">
                "{graduate.bio}"
              </p>
            </div>
          )}

          {/* Formación Académica en Cuba */}
          <div className="bg-white rounded-[3rem] p-8 sm:p-10 border border-gray-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-16 -mt-16 opacity-50"></div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <AcademicIcon />
              </div>
              Formación Académica en Cuba
            </h2>

            <div className="space-y-10">
              {/* Pregrado */}
              <div className="relative pl-8 border-l-2 border-blue-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
                <div className="mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Pregrado</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{graduate.career}</h3>
                <p className="text-gray-700 font-medium">{graduate.university}</p>
                <div className="mt-3 flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Graduado en {graduate.graduationYear}</span>
                  <span className="flex items-center gap-1 capitalize"><div className="w-2 h-2 rounded-full bg-green-400"></div> {graduate.pregradoModalidad?.replace("_", " ")}</span>
                </div>
              </div>

              {/* Postgrados Múltiples */}
              {graduate.postgraduates && graduate.postgraduates.length > 0 && (
                <div className="relative pl-8 border-l-2 border-indigo-100 space-y-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white"></div>
                  <div className="mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Postgrado</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {graduate.postgraduates.map((pg: any) => (
                      <div key={pg.id} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                        <h3 className="text-xl font-bold text-gray-900 capitalize">{pg.program}</h3>
                        <p className="text-gray-700 font-medium">{pg.university}</p>
                        <div className="mt-2 flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Concluido en {pg.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Otros Estudios */}
              {(graduate.otherAcademicProgram || graduate.otherCubanInstitution) && (
                <div className="relative pl-8 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-400 rounded-full border-4 border-white"></div>
                  <div className="mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Otros Estudios</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{graduate.otherAcademicProgram || "Programa Académico"}</h3>
                  <p className="text-gray-700 font-medium">{graduate.otherCubanInstitution}</p>
                </div>
              )}
            </div>
          </div>

          {/* Habilidades y Competencias */}
          {graduate.skills && (
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-xl shadow-slate-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <BriefcaseIcon />
                </div>
                Habilidades y Competencias
              </h2>
              <div className="flex flex-wrap gap-3">
                {graduate.skills.split(",").map((skill, i) => (
                  <span key={i} className="px-5 py-3 bg-gray-50 text-gray-700 rounded-2xl text-base font-medium border border-gray-100 hover:border-blue-200 hover:bg-white transition-all cursor-default">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Intereses */}
          {graduate.interests && (
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 shadow-xl shadow-slate-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <HeartIcon />
                </div>
                Áreas de Interés
              </h2>
              <div className="flex flex-wrap gap-3">
                {graduate.interests.split(",").map((interest, i) => (
                  <span key={i} className="px-5 py-3 bg-rose-50/30 text-rose-700 rounded-2xl text-base font-medium border border-rose-100 transition-all cursor-default">
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// --- Componentes Auxiliares con Estilo ---

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#003f8f]">
          {icon}
        </div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Badge({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${colors[color] || colors.blue}`}>
      <span className="shrink-0">{icon}</span>
      {text}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}

function SocialLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-200 transition-all group">
      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">{icon}</div>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </a>
  );
}

// --- Icons (SVG Inline) ---

function LocationIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}

function UniversityIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
}

function CalendarIcon({ className }: { className?: string }) {
  return <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}

function EmailIcon({ className }: { className?: string }) {
  return <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}

function LinkedInIcon({ className }: { className?: string }) {
  return <svg className={className || "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
}

function IdIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>;
}

function GlobeIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
}

function AcademicIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" /></svg>;
}

function StarIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
}

function BriefcaseIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}

function HeartIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
}

function TranslateIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>;
}
