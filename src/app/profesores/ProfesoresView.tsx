"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy load the map to improve initial page load performance
const YogaMap = dynamic(() => import("@/components/YogaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full animate-pulse rounded-2xl bg-brand-50 flex items-center justify-center">
      <span className="text-brand-300 font-medium">Cargando mapa...</span>
    </div>
  ),
});

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 };

type TeacherWithProfile = {
  id: string;
  teacher_type: string | null;
  bio: string | null;
  specialties: string[] | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  average_price: number | null;
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
};

export default function ProfesoresView({
  teachers,
  classes = [],
}: {
  teachers: TeacherWithProfile[];
  classes?: ClassForMap[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => t.specialties?.forEach((s) => set.add(s)));
    classes.forEach((c) => {
      if (c.style) set.add(c.style);
    });
    return Array.from(set).sort();
  }, [teachers, classes]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const profile = t.profiles;
      const name = profile?.full_name?.toLowerCase() || "";
      const addr = t.address?.toLowerCase() || "";
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || name.includes(q) || addr.includes(q);
      const matchesSpecialty =
        !specialtyFilter || t.specialties?.includes(specialtyFilter);

      const hasMatchingClass = classes.some((c) => {
        if (c.teacher_id !== t.id) return false;
        const cTitle = c.title.toLowerCase();
        const cAddr = c.address?.toLowerCase() || "";
        const cMatchesSearch = !q || cTitle.includes(q) || cAddr.includes(q);
        const cMatchesSpecialty = !specialtyFilter || c.style === specialtyFilter;
        return cMatchesSearch && cMatchesSpecialty;
      });

      return (matchesSearch && matchesSpecialty) || hasMatchingClass;
    });
  }, [teachers, classes, searchQuery, specialtyFilter]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (!c.latitude || !c.longitude) return false;
      const title = c.title.toLowerCase();
      const addr = c.address?.toLowerCase() || "";
      const q = searchQuery.toLowerCase();
      
      const matchesSearch = !q || title.includes(q) || addr.includes(q);
      const matchesSpecialty = 
        !specialtyFilter || 
        c.style === specialtyFilter || 
        teachers.find(t => t.id === c.teacher_id)?.specialties?.includes(specialtyFilter);

      return matchesSearch && matchesSpecialty;
    });
  }, [classes, searchQuery, specialtyFilter, teachers]);

  const mappableTeachers = useMemo(
    () => filteredTeachers.filter((t) => t.latitude && t.longitude),
    [filteredTeachers]
  );

  const mapCenter = useMemo(() => {
    const allMappable = [...mappableTeachers, ...filteredClasses];
    if (allMappable.length === 0) return DEFAULT_CENTER;
    const avgLat =
      allMappable.reduce((s, item) => s + item.latitude!, 0) / allMappable.length;
    const avgLng =
      allMappable.reduce((s, item) => s + item.longitude!, 0) / allMappable.length;
    return { lat: avgLat, lng: avgLng };
  }, [mappableTeachers, filteredClasses]);

  const handleMarkerSelect = useCallback((id: string) => {
    setSelectedMarkerId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="mb-2 inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
          Directorio
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Profesores y Clases
        </h1>
        <p className="mt-4 text-lg text-foreground/60">
          Descubrí instructores y centros, filtrá por especialidad o ciudad, y explora las clases en el mapa.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, clase o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-brand-200/60 bg-white/60 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/30 backdrop-blur-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
          />
        </div>
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="rounded-xl border border-brand-200/60 bg-white/60 px-4 py-3 text-sm text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        >
          <option value="">Todas las especialidades</option>
          {allSpecialties.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        {(searchQuery || specialtyFilter) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSpecialtyFilter("");
              setSelectedMarkerId(null);
            }}
            className="rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100/50 shadow-lg shadow-brand-500/5">
        <YogaMap
          mappableTeachers={mappableTeachers}
          filteredClasses={filteredClasses}
          mapCenter={mapCenter}
          selectedMarkerId={selectedMarkerId}
          onMarkerSelect={handleMarkerSelect}
        />
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <Link
            key={teacher.id}
            href={`/profesores/${teacher.id}`}
            className="glass group flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-48 w-full shrink-0 overflow-hidden bg-brand-50">
              {teacher.profiles?.avatar_url ? (
                <img
                  src={teacher.profiles.avatar_url}
                  alt={teacher.profiles.full_name || "Profesor"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">🧘</div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-bold text-foreground group-hover:text-brand-600">
                {teacher.profiles?.full_name || "Instructor de Yoga"}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/60 font-sans">
                {teacher.bio || "Explora las clases de este instructor."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {teacher.specialties?.slice(0, 3).map((spec) => (
                  <span key={spec} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
