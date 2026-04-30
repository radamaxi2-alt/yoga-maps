"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const YogaMap = dynamic(() => import("@/components/YogaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full animate-pulse rounded-2xl bg-brand-50 flex items-center justify-center">
      <span className="text-brand-300 font-medium">Cargando mapa...</span>
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
    teachers.forEach((t) => t.specialties?.forEach((s) => set.add(s)));
    classes.forEach((c) => {
      if (c.style) set.add(c.style);
    });
    return Array.from(set).sort();
  }, [teachers, classes]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchQuery.toLowerCase();
      const name = t.profiles?.full_name?.toLowerCase() || "";
      const addr = t.address?.toLowerCase() || "";
      const matchesSearch = !q || name.includes(q) || addr.includes(q);
      const matchesSpecialty = !specialtyFilter || t.specialties?.includes(specialtyFilter);
      
      const teacherClasses = classes.filter(c => c.teacher_id === t.id);
      const matchesCategory = !categoryFilter || teacherClasses.some(c => c.category === categoryFilter);

      return matchesSearch && matchesSpecialty && matchesCategory;
    });
  }, [teachers, classes, searchQuery, specialtyFilter, categoryFilter]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (!c.latitude || !c.longitude) return false;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || (c.address?.toLowerCase().includes(q));
      const matchesSpecialty = !specialtyFilter || c.style === specialtyFilter;
      const matchesCategory = !categoryFilter || (c.category || "clase") === categoryFilter;
      
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
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Profesores y Eventos
        </h1>
        <p className="mt-4 text-lg text-foreground/60">
          Explora retiros, formaciones y clases en Mar del Plata.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-brand-200/60 bg-white/60 py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-brand-200/60 bg-white/60 px-4 py-3 text-sm"
        >
          <option value="">Todas las categorías</option>
          <option value="clase">🧘 Clases</option>
          <option value="retiro">🏕️ Retiros</option>
          <option value="armonizacion">🔔 Armonizaciones</option>
          <option value="formacion">🎓 Formaciones</option>
        </select>
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="rounded-xl border border-brand-200/60 bg-white/60 px-4 py-3 text-sm"
        >
          <option value="">Especialidades</option>
          {allSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!hideMap && (
        <div className="overflow-hidden rounded-3xl border border-brand-100/50 shadow-xl mb-16">
          <YogaMap
            mappableTeachers={mappableTeachers}
            filteredClasses={filteredClasses}
            mapCenter={mapCenter}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={handleMarkerSelect}
          />
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="glass group flex flex-col overflow-hidden rounded-3xl transition-all hover:-translate-y-1"
          >
            <Link href={`/profesores/${teacher.id}`} className="h-48 bg-brand-50 block overflow-hidden">
              {teacher.profiles?.avatar_url ? (
                <img src={teacher.profiles.avatar_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl opacity-20">🧘</div>
              )}
            </Link>
            <div className="p-6">
              <h3 className="text-xl font-bold">{teacher.profiles?.full_name || "Instructor"}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/60">{teacher.bio}</p>
              
              <div className="mt-6 flex items-center justify-between">
                <Link href={`/profesores/${teacher.id}`} className="text-xs font-bold text-brand-600 hover:underline">
                  Ver Perfil
                </Link>
                <Link 
                  href={`/mapa?teacher=${teacher.id}`} 
                  className="rounded-full bg-brand-50 px-4 py-1.5 text-[10px] font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  📍 Ver en Mapa
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
