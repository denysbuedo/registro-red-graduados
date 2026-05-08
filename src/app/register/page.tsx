"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postgraduates, setPostgraduates] = useState<{ university: string; program: string; year: string }[]>([]);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const hasUndergrad = formData.get("university") && formData.get("career") && formData.get("graduationYear");
    
    if (!hasUndergrad && postgraduates.length === 0) {
      setError("Debe registrar al menos su formación de Pregrado o un programa de Posgrado.");
      setLoading(false);
      return;
    }

    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      university: formData.get("university"),
      name: formData.get("name"),
      birthDate: formData.get("birthDate"),
      birthCountry: formData.get("birthCountry"),
      country: formData.get("country"),
      passport: formData.get("passport") || null,
      phone: formData.get("phone"),
      career: formData.get("career"),
      graduationYear: parseInt(formData.get("graduationYear") as string),
      pregradoModalidad: formData.get("pregradoModalidad"),
      postgraduates: postgraduates.filter(pg => pg.university && pg.program && pg.year),
      otherAcademicProgram: formData.get("otherAcademicProgram") || null,
      otherCubanInstitution: formData.get("otherCubanInstitution") || null,
      currentProfession: formData.get("currentProfession"),
      currentCompany: formData.get("currentCompany"),
      city: formData.get("city") || null,
      bio: formData.get("bio") || null,
      linkedin: formData.get("linkedin") || null,
      website: formData.get("website") || null,
      skills: formData.get("skills") || null,
      languages: formData.get("languages") || null,
      interests: formData.get("interests") || null,
      photoUrl: formData.get("photoUrl") || null,
    };

    try {
      const res = await fetch("/api/auth/register-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Error al registrarse");
      }

      window.location.href = "/pendiente";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-32">
      {/* Top Banner */}
      <div className="bg-[#003f8f] h-[300px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.4),transparent_50%)]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pt-16 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">Unirse a la Red</h1>
          <p className="text-blue-100 text-lg font-normal opacity-80">Registra tu trayectoria académica y profesional en Cuba</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-gray-100 p-8 sm:p-12">
          {error && (
            <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-700 text-sm font-medium flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-16">
            
            {/* Sección 1: Seguridad */}
            <FormSection title="Credenciales de Acceso" icon={<LockIcon />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField label="Nombre de Usuario" name="username" required placeholder="Elegir username" />
                <InputField label="Correo Electrónico" name="email" type="email" required placeholder="ejemplo@correo.com" />
                <div className="sm:col-span-2">
                   <InputField label="Contraseña" name="password" type="password" required placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
            </FormSection>

            {/* Sección 2: Personal */}
            <FormSection title="Información de Identidad" icon={<UserIcon />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <InputField label="Nombre y Apellidos (Obligatorio)" name="name" required placeholder="Nombre completo según documento" />
                </div>
                <InputField label="Fecha de Nacimiento" name="birthDate" type="date" required />
                <SelectField label="País de Nacimiento" name="birthCountry" required options={COUNTRIES} />
                <SelectField label="País donde Reside" name="country" required options={COUNTRIES} />
                <InputField 
                  label="Número de Pasaporte" 
                  name="passport" 
                  placeholder="Opcional" 
                  pattern="^[A-Za-z0-9]+$"
                  title="Solo letras y números, sin espacios"
                  maxLength={20}
                />
                <InputField 
                  label="Teléfono (WhatsApp/WeChat/Telegram)" 
                  name="phone" 
                  required 
                  placeholder="+1 ..." 
                  pattern="^\+?[0-9\s\-]{7,20}$"
                  title="Número de teléfono válido (puede incluir +, espacios o guiones)"
                />
                <div className="sm:col-span-2">
                  <InputField label="URL Foto de Perfil" name="photoUrl" placeholder="https://..." />
                </div>
              </div>
            </FormSection>

            {/* Sección 3: Académica Pregrado */}
            <FormSection title="Formación de Pregrado en Cuba (Opcional si tiene Posgrado)" icon={<AcademicIcon />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <SelectField label="IES Cubana de estudios" name="university" options={UNIVERSITIES} />
                </div>
                <InputField label="Carrera cursada" name="career" placeholder="Ej: Medicina, Ingeniería..." />
                <InputField label="Año de Graduación" name="graduationYear" type="number" min={1960} max={2030} placeholder="2020" />
                <div className="sm:col-span-2">
                  <SelectField 
                    label="Modalidad de Estudios" 
                    name="pregradoModalidad" 
                    options={[
                      { value: "becario", label: "Becario" },
                      { value: "financiado_gobierno", label: "Financiado por Gobierno" },
                      { value: "autofinanciado", label: "Autofinanciado" }
                    ]} 
                  />
                </div>
              </div>
            </FormSection>

            {/* Sección 4: Académica Postgrado */}
            <FormSection title="Formación de Postgrado (Si aplica)" icon={<AcademicIcon />}>
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
            </FormSection>

            {/* Sección 5: Profesional */}
            <FormSection title="Situación Profesional Actual" icon={<BriefcaseIcon />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField label="Institución / Empresa" name="currentCompany" required placeholder="Lugar de trabajo actual" />
                <InputField label="Cargo / Posición" name="currentProfession" required placeholder="Tu puesto de trabajo" />
                <InputField label="Ciudad" name="city" placeholder="Ciudad de residencia actual" />
              </div>
            </FormSection>

            {/* Sección 6: Redes */}
            <FormSection title="Perfil Digital y Competencias" icon={<GlobeIcon />}>
              <div className="space-y-6">
                <TextAreaField 
                  label="Biografía Profesional (Máx 200 caracteres)" 
                  name="bio" 
                  placeholder="Cuéntanos un poco sobre tu trayectoria y logros..." 
                  rows={4} 
                  maxLength={200}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField label="LinkedIn URL" name="linkedin" placeholder="https://..." />
                  <InputField label="Sitio Web / Blog" name="website" placeholder="https://..." />
                </div>
                <InputField label="Habilidades (Separadas por comas)" name="skills" placeholder="Ej: Investigación, Docencia, Gestión..." />
                <InputField label="Idiomas" name="languages" placeholder="Español, Inglés..." />
                <InputField label="Áreas de Interés" name="interests" placeholder="Cooperación, Ciencia, Salud..." />
              </div>
            </FormSection>

            <div className="pt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#003f8f] hover:bg-[#002e6a] disabled:bg-gray-200 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] text-sm transition-all shadow-2xl shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Completar Registro</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
              
              <div className="mt-8 text-center">
                <Link href="/login" className="text-gray-400 hover:text-blue-600 font-semibold uppercase tracking-widest text-xs transition-colors">
                  ← Ya soy parte de la red
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#003f8f]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, name, type = "text", required, placeholder, min, max, pattern, title, maxLength, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        pattern={pattern}
        title={title}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none placeholder-gray-300"
      />
    </div>
  );
}

function SelectField({ label, name, required, options, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none appearance-none cursor-pointer"
        >
          <option value="" className="text-gray-400">Seleccionar opción...</option>
          {options.map((opt: any) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const labelText = typeof opt === 'string' ? opt : opt.label;
            return <option key={optValue} value={optValue}>{labelText}</option>;
          })}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TextAreaField({ label, name, placeholder, rows = 3, maxLength }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center ml-1">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      </div>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none resize-none placeholder-gray-300"
      />
    </div>
  );
}

// --- Icons ---

function LockIcon() {
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
}

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
