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
    <section className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ${hideMap ? 'bg-surface' : 'bg-surface-dark-alt min-h-screen'}`}>
      <div className={`max-w-2xl mb-10 ${hideMap ? '' : 'text-center mx-auto'}`}>
        <h1 className={`text-4xl font-extrabold tracking-tight ${hideMap ? 'text-foreground' : 'text-white'}`}>
          {hideMap ? 'Instructores de Yoga' : 'Mapa de Mar del Plata'}
        </h1>
        <p className={`mt-4 text-lg ${hideMap ? 'text-foreground/60' : 'text-brand-100/60'}`}>
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
        <div className="mb-12">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Buscar profesor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-xl border border-brand-200/60 py-3 px-4 text-sm"
            />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="rounded-xl border border-brand-200/60 px-4 py-3 text-sm"
            >
              <option value="">Todas las especialidades</option>
              {allSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className={`mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ${hideMap ? '' : 'hidden'}`}>
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="glass group flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1">
            <Link href={`/profesores/${teacher.id}`} className="h-40 bg-brand-50 block overflow-hidden">
              {teacher.profiles?.avatar_url ? (
                <img src={teacher.profiles.avatar_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl opacity-20">🧘</div>
              )}
            </Link>
            <div className="p-6">
              <h3 className="text-lg font-bold">{teacher.profiles?.full_name || "Instructor"}</h3>
              <p className="mt-2 line-clamp-2 text-xs text-foreground/60">{teacher.bio}</p>
              <div className="mt-6 flex items-center justify-between">
                <Link href={`/profesores/${teacher.id}`} className="text-[10px] font-bold text-brand-600 hover:underline">Ver Perfil</Link>
                <Link href={`/mapa?teacher=${teacher.id}`} className="rounded-full bg-brand-50 px-4 py-1.5 text-[10px] font-bold text-brand-700">📍 Ver en Mapa</Link>
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
