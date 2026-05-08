"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UNIVERSITIES } from "@/lib/universities";

const COUNTRIES = [
  "Argentina", "Bolivia", "Brasil", "Canadá", "Chile", "Colombia",
  "Costa Rica", "Cuba", "Ecuador", "El Salvador", "España", "Estados Unidos",
  "Francia", "Guatemala", "Guyana", "Haití", "Honduras", "Italia",
  "Jamaica", "México", "Nicaragua", "Panamá", "Paraguay", "Perú",
  "Puerto Rico", "República Dominicana", "Suriname", "Trinidad y Tobago",
  "Uruguay", "Venezuela", "Alemania", "Reino Unido", "Angola", "Mozambique",
  "Sudáfrica", "Nigeria", "Argelia", "China", "Japón", "India",
  "Australia", "Otro",
];

export default function EditarPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const [postgraduates, setPostgraduates] = useState<{ id?: number; university: string; program: string; year: string }[]>([]);

  const addPostgraduate = () => {
    setPostgraduates([...postgraduates, { university: "", program: "", year: "" }]);
  };

  const removePostgraduate = (index: number) => {
    const newPg = [...postgraduates];
    newPg.splice(index, 1);
    setPostgraduates(newPg);
  };

  const handlePostgraduateChange = (index: number, field: string, value: string) => {
    const newPg = [...postgraduates];
    newPg[index] = { ...newPg[index], [field]: value };
    setPostgraduates(newPg);
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/graduates/${id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Verificar si el usuario tiene permiso para editar este perfil
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        
        if (meData.user?.id !== data.userId && meData.user?.role !== "admin") {
          router.push(`/egresados/${id}`);
          return;
        }

        setFormData(data);
        if (data.postgraduates) {
          setPostgraduates(data.postgraduates);
        }
      } else {
        setError("No se pudo cargar el perfil.");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Error de conexión.");
    } finally {
      setFetching(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      birthDate: (form.elements.namedItem("birthDate") as HTMLInputElement).value,
      birthCountry: (form.elements.namedItem("birthCountry") as HTMLSelectElement).value,
      country: (form.elements.namedItem("country") as HTMLSelectElement).value,
      passport: (form.elements.namedItem("passport") as HTMLInputElement).value || null,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      university: (form.elements.namedItem("university") as HTMLSelectElement).value,
      career: (form.elements.namedItem("career") as HTMLInputElement).value,
      graduationYear: parseInt((form.elements.namedItem("graduationYear") as HTMLInputElement).value),
      pregradoModalidad: (form.elements.namedItem("pregradoModalidad") as HTMLSelectElement).value,
      postgraduates: postgraduates.filter(pg => pg.university && pg.program && pg.year),
      otherAcademicProgram: (form.elements.namedItem("otherAcademicProgram") as HTMLInputElement).value || null,
      otherCubanInstitution: (form.elements.namedItem("otherCubanInstitution") as HTMLInputElement).value || null,
      currentProfession: (form.elements.namedItem("currentProfession") as HTMLInputElement).value,
      currentCompany: (form.elements.namedItem("currentCompany") as HTMLInputElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value || null,
      bio: (form.elements.namedItem("bio") as HTMLTextAreaElement).value || null,
      photoUrl: (form.elements.namedItem("photoUrl") as HTMLInputElement).value || null,
      linkedin: (form.elements.namedItem("linkedin") as HTMLInputElement).value || null,
      website: (form.elements.namedItem("website") as HTMLInputElement).value || null,
      skills: (form.elements.namedItem("skills") as HTMLInputElement).value || null,
      languages: (form.elements.namedItem("languages") as HTMLInputElement).value || null,
      interests: (form.elements.namedItem("interests") as HTMLInputElement).value || null,
    };

    try {
      const res = await fetch(`/api/graduates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Error al actualizar perfil");
      }

      router.push(`/egresados/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#003f8f] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-500 font-medium">Sincronizando con el servidor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/egresados/${id}`} 
              className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-2xl transition-all border border-transparent hover:border-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Editar Perfil</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Actualiza tu trayectoria profesional</p>
            </div>
          </div>
          <div className="hidden sm:block">
             <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-tighter border border-blue-100">
               Modo Edición
             </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        {error && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-700 text-sm font-medium flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <FormSection title="Información Personal" icon={<UserIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Nombre Completo" name="name" required defaultValue={formData?.name} placeholder="Ej: Juan Pérez" />
              <InputField label="Fecha de Nacimiento" name="birthDate" type="date" required defaultValue={formData?.birthDate} />
              <SelectField label="País de Nacimiento" name="birthCountry" required defaultValue={formData?.birthCountry} options={COUNTRIES} />
              <SelectField label="Residencia Actual" name="country" required defaultValue={formData?.country} options={COUNTRIES} />
              <InputField 
                label="Nro. de Pasaporte" 
                name="passport" 
                defaultValue={formData?.passport} 
                placeholder="Opcional"
                pattern="^[A-Za-z0-9]+$"
                title="Solo letras y números, sin espacios"
                maxLength={20}
              />
              <InputField 
                label="Teléfono / WhatsApp" 
                name="phone" 
                required 
                defaultValue={formData?.phone} 
                placeholder="+53 ..."
                pattern="^\+?[0-9\s\-]{7,20}$"
                title="Número de teléfono válido"
              />
              <div className="md:col-span-2">
                <InputField label="URL Foto de Perfil" name="photoUrl" defaultValue={formData?.photoUrl} placeholder="https://..." />
              </div>
            </div>
          </FormSection>

          <FormSection title="Formación en Cuba" icon={<AcademicIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <SelectField label="IES de Pregrado" name="university" required defaultValue={formData?.university} options={UNIVERSITIES} />
              </div>
              <InputField label="Carrera cursada" name="career" required defaultValue={formData?.career} placeholder="Ej: Ingeniería Informática" />
              <InputField label="Año de Graduación" name="graduationYear" type="number" required defaultValue={formData?.graduationYear} />
              <SelectField 
                label="Modalidad de Estudios" 
                name="pregradoModalidad" 
                required 
                defaultValue={formData?.pregradoModalidad} 
                options={[
                  { value: "becario", label: "Becario" },
                  { value: "financiado_gobierno", label: "Financiado por Gobierno" },
                  { value: "autofinanciado", label: "Autofinanciado" }
                ]} 
              />
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Estudios de Postgrado</h3>
              <div className="space-y-6">
                {postgraduates.map((pg, index) => (
                  <div key={index} className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] relative">
                    <button 
                      type="button" 
                      onClick={() => removePostgraduate(index)}
                      className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="sm:col-span-2">
                        <SelectField 
                          label="IES de Postgrado" 
                          value={pg.university} 
                          onChange={(e: any) => handlePostgraduateChange(index, "university", e.target.value)}
                          options={UNIVERSITIES} 
                        />
                      </div>
                      <SelectField 
                        label="Tipo de Programa" 
                        value={pg.program} 
                        onChange={(e: any) => handlePostgraduateChange(index, "program", e.target.value)}
                        options={[
                          { value: "maestria", label: "Maestría" },
                          { value: "doctorado", label: "Doctorado" },
                          { value: "especialidad", label: "Especialidad Médica/Técnica" }
                        ]} 
                      />
                      <InputField 
                        label="Año de Graduación" 
                        type="number" 
                        min={1960} 
                        max={2030} 
                        value={pg.year}
                        onChange={(e: any) => handlePostgraduateChange(index, "year", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={addPostgraduate}
                  className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-[2rem] font-bold hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Añadir Programa de Postgrado
                </button>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Otros Vínculos Académicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Nombre del Programa" name="otherAcademicProgram" defaultValue={formData?.otherAcademicProgram} placeholder="Ej: Diplomado, Curso Corto..." />
                <InputField label="Institución Cubana" name="otherCubanInstitution" defaultValue={formData?.otherCubanInstitution} placeholder="Ej: Centro de Biotecnología" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Carrera Profesional" icon={<BriefcaseIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Institución / Empresa Actual" name="currentCompany" required defaultValue={formData?.currentCompany} />
              <InputField label="Cargo / Posición" name="currentProfession" required defaultValue={formData?.currentProfession} />
              <InputField label="Ciudad" name="city" defaultValue={formData?.city} placeholder="Ej: Luanda, Madrid..." />
            </div>
          </FormSection>

          <FormSection title="Biografía y Competencias" icon={<GlobeIcon />}>
            <div className="space-y-6">
              <TextAreaField 
                label="Bio Profesional (Máx 200 caracteres)" 
                name="bio" 
                rows={5} 
                defaultValue={formData?.bio} 
                placeholder="Escribe una breve descripción sobre ti..." 
                maxLength={200}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="LinkedIn URL" name="linkedin" defaultValue={formData?.linkedin} placeholder="https://linkedin.com/in/..." />
                <InputField label="Sitio Web / Portfolio" name="website" defaultValue={formData?.website} placeholder="https://..." />
              </div>
              <InputField label="Habilidades (Separadas por comas)" name="skills" defaultValue={formData?.skills} placeholder="Python, Liderazgo, Gestión de Proyectos..." />
              <InputField label="Idiomas (Separadas por comas)" name="languages" defaultValue={formData?.languages} placeholder="Español, Inglés, Portugués..." />
              <InputField label="Intereses (Separadas por comas)" name="interests" defaultValue={formData?.interests} placeholder="Investigación, Biotecnología, Docencia..." />
            </div>
          </FormSection>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
             <Link 
               href={`/egresados/${id}`} 
               className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 rounded-[2rem] font-bold transition-all hover:bg-gray-50 hover:text-gray-700 text-center shadow-sm"
             >
              Cancelar Cambios
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-[#003f8f] hover:bg-[#002e6a] disabled:bg-gray-300 text-white rounded-[2rem] font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Perfil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// --- Componentes de Formulario Premium ---

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[3rem] p-8 sm:p-10 border border-gray-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#003f8f]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, name, type = "text", required, defaultValue, placeholder, pattern, title, maxLength, value, onChange, min, max }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none placeholder-gray-300"
      />
    </div>
  );
}

function SelectField({ label, name, required, defaultValue, options, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none appearance-none"
      >
        <option value="" className="text-gray-400">Seleccionar opción...</option>
        {options.map((opt: any) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const labelText = typeof opt === 'string' ? opt : opt.label;
          return <option key={optValue} value={optValue}>{labelText}</option>;
        })}
      </select>
    </div>
  );
}

function TextAreaField({ label, name, rows = 3, defaultValue, placeholder, maxLength }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none resize-none placeholder-gray-300"
      />
    </div>
  );
}

// --- Iconos ---

function UserIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}

function AcademicIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
}

function BriefcaseIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}

function GlobeIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
}
