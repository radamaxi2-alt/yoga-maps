"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const YogaMap = dynamic(() => import("@/components/YogaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] w-full animate-pulse rounded-[2.5rem] bg-surface-dark-alt flex items-center justify-center">
      <span className="text-brand-300 font-medium italic">Dibujando Mar del Plata...</span>
    </div>
  ),
});

const DEFAULT_CENTER = { lat: -38.0055, lng: -57.5426 };

type TeacherWithProfile = {
  id: string;
  teacher_type: string | null;
  bio: string | null;
  specialties: string[] | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    community_score: number | null;
  } | null;
};

type ClassForMap = {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  teacher_id: string;
  is_full: boolean | null;
  style: string | null;
  category: string | null;
};

export default function ProfesoresView({
  teachers,
  classes = [],
  initialCategory = "",
  hideMap = false,
}: {
  teachers: TeacherWithProfile[];
  classes?: ClassForMap[];
  initialCategory?: string;
  hideMap?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => t.specialties?.forEach((s) => set.add(s.toLowerCase())));
    classes.forEach((c) => {
      if (c.style) set.add(c.style.toLowerCase());
    });
    return Array.from(set).sort();
  }, [teachers, classes]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase();
      const name = t.profiles?.full_name?.toLowerCase() || "";
      const addr = t.address?.toLowerCase() || "";
      const specs = t.specialties?.map(s => s.toLowerCase()) || [];
      
      const matchesSearch = !q || name.includes(q) || addr.includes(q);
      const matchesSpecialty = !specialtyFilter || specs.some(s => s.includes(specialtyFilter.toLowerCase()));
      
      const teacherClasses = classes.filter(c => c.teacher_id === t.id);
      const matchesCategory = !categoryFilter || teacherClasses.some(c => (c.category || "clase").toLowerCase() === categoryFilter.toLowerCase());

      return matchesSearch && matchesSpecialty && matchesCategory;
    });
  }, [teachers, classes, searchQuery, specialtyFilter, categoryFilter]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (!c.latitude || !c.longitude) return false;
      const q = searchQuery.toLowerCase();
      const s = specialtyFilter.toLowerCase();
      const cat = categoryFilter.toLowerCase();

      const matchesSearch = !q || c.title.toLowerCase().includes(q) || (c.address?.toLowerCase().includes(q));
      const matchesSpecialty = !s || (c.style?.toLowerCase() || "").includes(s);
      const matchesCategory = !cat || (c.category || "clase").toLowerCase() === cat;
      
      return matchesSearch && matchesSpecialty && matchesCategory;
    });
  }, [classes, searchQuery, specialtyFilter, categoryFilter]);

  const mappableTeachers = useMemo(
    () => filteredTeachers.filter((t) => t.latitude && t.longitude),
    [filteredTeachers]
  );

  const mapCenter = useMemo(() => {
    const allMappable = [...mappableTeachers, ...filteredClasses];
    if (allMappable.length === 0) return DEFAULT_CENTER;
    const avgLat = allMappable.reduce((s, item) => s + item.latitude!, 0) / allMappable.length;
    const avgLng = allMappable.reduce((s, item) => s + item.longitude!, 0) / allMappable.length;
    return { lat: avgLat, lng: avgLng };
  }, [mappableTeachers, filteredClasses]);

  const handleMarkerSelect = useCallback((id: string) => {
    setSelectedMarkerId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ${hideMap ? 'bg-surface-dark-alt min-h-screen' : 'bg-surface-dark-alt min-h-screen'}`}>
      <div className={`max-w-2xl mb-10 text-center mx-auto`}>
        <h1 className={`text-4xl font-extrabold tracking-tight text-white`}>
          {hideMap ? 'Instructores de Yoga' : 'Mapa de Mar del Plata'}
        </h1>
        <p className={`mt-4 text-lg text-brand-100/60`}>
          {hideMap ? 'Directorio verificado de profesores y escuelas.' : 'Encontrá tu lugar en la ciudad.'}
        </p>
      </div>

      {!hideMap ? (
        <div className="relative h-[75vh] w-full overflow-hidden rounded-[3rem] shadow-2xl border border-white/5 ring-1 ring-white/10">
          {/* Floating Filters */}
          <div className="absolute top-8 left-1/2 z-10 w-[90%] -translate-x-1/2 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre o lugar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-surface-dark/60 py-4 px-8 text-sm text-white placeholder:text-white/40 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-lg"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-full border border-white/10 bg-surface-dark/60 px-8 py-4 text-sm text-white backdrop-blur-xl focus:outline-none shadow-lg cursor-pointer hover:bg-surface-dark/80 transition-colors"
            >
              <option value="">Categorías</option>
              <option value="clase">🧘 Clases</option>
              <option value="retiro">🏕️ Retiros</option>
              <option value="armonizacion">🔔 Armonizaciones</option>
              <option value="formacion">🎓 Formaciones</option>
            </select>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="rounded-full border border-white/10 bg-surface-dark/60 px-8 py-4 text-sm text-white backdrop-blur-xl focus:outline-none shadow-lg cursor-pointer hover:bg-surface-dark/80 transition-colors"
            >
              <option value="">Especialidades</option>
              {allSpecialties.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          <YogaMap
            mappableTeachers={mappableTeachers}
            filteredClasses={filteredClasses}
            mapCenter={mapCenter}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={handleMarkerSelect}
          />
        </div>
      ) : (
        <div className="mb-16">
          <div className="flex flex-col gap-4 sm:flex-row max-w-4xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar profesor por nombre o especialidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 px-6 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="">Todas las especialidades</option>
              {allSpecialties.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className={`mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 ${filteredTeachers.length > 0 ? '' : 'hidden'}`}>
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-surface-dark/50 border border-white/5 backdrop-blur-2xl transition-all duration-500 hover:border-brand-500/40 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] hover:-translate-y-2">
            <Link href={`/profesores/${teacher.id}`} className="h-56 bg-brand-900/10 block overflow-hidden relative">
              {teacher.profiles?.avatar_url ? (
                <img src={teacher.profiles.avatar_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-900/20 to-surface-dark text-6xl">
                  <span className="opacity-30 filter grayscale">🧘</span>
                </div>
              )}
              {/* Profile badge overlay */}
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1.5 rounded-full bg-surface-dark/80 px-3 py-1 text-[10px] font-bold text-brand-300 uppercase tracking-widest backdrop-blur-md ring-1 ring-white/10 shadow-xl">
                  <svg className="h-3 w-3 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {teacher.profiles?.community_score || 0}
                </span>
              </div>
            </Link>
            
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-white group-hover:text-brand-400 transition-colors duration-300">
                {teacher.profiles?.full_name || "Instructor de Yoga"}
              </h3>
              
              <p className="mt-4 line-clamp-3 text-sm text-brand-100/50 leading-relaxed font-sans flex-1">
                {teacher.bio || "Este instructor aún no ha cargado su biografía, pero puedes explorar sus clases y eventos disponibles en Mar del Plata."}
              </p>
              
              <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-8">
                <Link href={`/profesores/${teacher.id}`} className="group/btn relative overflow-hidden rounded-full bg-brand-600/10 px-6 py-2.5 text-xs font-bold text-brand-400 transition-all hover:bg-brand-600 hover:text-white">
                  VER PERFIL
                </Link>
                <Link href={`/mapa?teacher=${teacher.id}`} className="flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 text-[10px] font-black text-white hover:bg-white/10 transition-all tracking-tighter uppercase">
                  <span>📍</span> UBICACIÓN
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hideMap && filteredTeachers.length === 0 && (
        <div className="text-center py-20 text-foreground/40 font-medium">
          No se encontraron profesores que coincidan con tu búsqueda.
        </div>
      )}
    </section>
  );
}
