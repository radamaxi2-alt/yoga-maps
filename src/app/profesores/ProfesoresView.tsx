"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMarkerRef,
} from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Default center: Buenos Aires
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
  jitsi_room_link: string | null;
};

// --- Teacher Marker Component ---
function TeacherMarker({
  teacher,
  isSelected,
  onSelect,
}: {
  teacher: TeacherWithProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [markerRef, marker] = useMarkerRef();
  const name = teacher.profiles?.full_name || "Profesor";
  const isSchool = teacher.teacher_type === "escuela";

  return (
    <>
      <Marker
        ref={markerRef}
        position={{ lat: teacher.latitude!, lng: teacher.longitude! }}
        onClick={onSelect}
        title={name}
        label={{ text: isSchool ? "🏛️" : "🧘", className: "text-xl" }}
      />
      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => onSelect()}>
          <div className="max-w-[200px] p-1 font-sans">
            <p className="font-bold text-brand-900">{name}</p>
            <p className="text-xs font-semibold text-brand-600 mb-1">
              {isSchool ? "Centro / Escuela" : "Instructor"}
            </p>
            {teacher.address && (
              <p className="mt-0.5 text-xs text-gray-600">📍 {teacher.address}</p>
            )}
            {teacher.specialties && teacher.specialties.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {teacher.specialties.slice(0, 3).join(", ")}
              </p>
            )}
            <Link
              href={`/profesores/${teacher.id}`}
              className="mt-2 inline-block text-xs font-bold text-brand-600 hover:text-brand-500 underline"
            >
              Ver perfil →
            </Link>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// --- Class Marker Component ---
function ClassMarker({
  cls,
  isSelected,
  onSelect,
}: {
  cls: ClassForMap;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [markerRef, marker] = useMarkerRef();

  return (
    <>
      <Marker
        ref={markerRef}
        position={{ lat: cls.latitude!, lng: cls.longitude! }}
        onClick={onSelect}
        title={cls.title}
        label={{ text: "🪷", className: "text-lg" }}
      />
      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => onSelect()}>
          <div className="max-w-[200px] p-1 font-sans">
            <div className="flex items-center gap-1 mb-1">
              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 uppercase">Clase</span>
              {cls.is_full && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 uppercase">Llena</span>
              )}
            </div>
            <p className="font-bold text-gray-900">{cls.title}</p>
            {cls.address && (
              <p className="mt-0.5 text-xs text-gray-500">📍 {cls.address}</p>
            )}
            <Link
              href={`/profesores/${cls.teacher_id}`}
              className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700 underline"
            >
              Ver detalles →
            </Link>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// --- Main View ---
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

  // Extract all unique specialties
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => t.specialties?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [teachers]);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const profile = t.profiles;
      const name = profile?.full_name?.toLowerCase() || "";
      const addr = t.address?.toLowerCase() || "";
      const q = searchQuery.toLowerCase();

      const matchesSearch = !q || name.includes(q) || addr.includes(q);
      const matchesSpecialty =
        !specialtyFilter || t.specialties?.includes(specialtyFilter);

      return matchesSearch && matchesSpecialty;
    });
  }, [teachers, searchQuery, specialtyFilter]);

  // Filtered classes (only show classes that match the search query)
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (!c.latitude || !c.longitude) return false;
      const title = c.title.toLowerCase();
      const addr = c.address?.toLowerCase() || "";
      const q = searchQuery.toLowerCase();
      return !q || title.includes(q) || addr.includes(q);
    });
  }, [classes, searchQuery]);

  // Teachers with valid coordinates (for map)
  const mappableTeachers = useMemo(
    () => filteredTeachers.filter((t) => t.latitude && t.longitude),
    [filteredTeachers]
  );

  // Compute map center from filtered items
  const mapCenter = useMemo(() => {
    const allMappable = [...mappableTeachers, ...filteredClasses];
    if (allMappable.length === 0) return DEFAULT_CENTER;
    const avgLat =
      allMappable.reduce((s, item) => s + item.latitude!, 0) / allMappable.length;
    const avgLng =
      allMappable.reduce((s, item) => s + item.longitude!, 0) / allMappable.length;
    return { lat: avgLat, lng: avgLng };
  }, [mappableTeachers, filteredClasses]);

  const handleMarkerSelect = useCallback(
    (id: string) => {
      setSelectedMarkerId((prev) => (prev === id ? null : id));
    },
    []
  );

  const hasApiKey = API_KEY && API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
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

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, clase o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-brand-200/60 bg-white/60 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/30 backdrop-blur-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="rounded-xl border border-brand-200/60 bg-white/60 px-4 py-3 text-sm text-foreground backdrop-blur-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
        >
          <option value="">Todas las especialidades</option>
          {allSpecialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Map */}
      {hasApiKey && (mappableTeachers.length > 0 || filteredClasses.length > 0) && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100/50 shadow-lg shadow-brand-500/5">
          <APIProvider apiKey={API_KEY}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={12}
              style={{ width: "100%", height: "450px" }}
              gestureHandling="cooperative"
              styles={[
                { featureType: "all", elementType: "geometry", stylers: [{ color: "#faf5f0" }] },
                { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#6d28d9" }] },
                { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
                { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#c4b5fd" }, { weight: 0.6 }] },
                { featureType: "poi", elementType: "geometry", stylers: [{ color: "#ede9fe" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#ddd6fe" }] },
              ]}
            >
              {mappableTeachers.map((t) => (
                <TeacherMarker
                  key={t.id}
                  teacher={t}
                  isSelected={selectedMarkerId === t.id}
                  onSelect={() => handleMarkerSelect(t.id)}
                />
              ))}
              {filteredClasses.map((c) => (
                <ClassMarker
                  key={`class-${c.id}`}
                  cls={c}
                  isSelected={selectedMarkerId === `class-${c.id}`}
                  onSelect={() => handleMarkerSelect(`class-${c.id}`)}
                />
              ))}
            </Map>
          </APIProvider>
        </div>
      )}

      {hasApiKey && mappableTeachers.length === 0 && filteredClasses.length === 0 && filteredTeachers.length > 0 && (
        <div className="mt-8 rounded-2xl border border-brand-100/40 bg-brand-50/30 p-6 text-center text-sm text-foreground/50 dark:border-surface-dark-alt dark:bg-surface-dark-alt/30">
          📍 Los resultados mostrados aún no cargaron su ubicación en el mapa.
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-medium text-foreground/60">
        <span className="flex items-center gap-1.5"><span className="text-lg">🧘</span> Instructor</span>
        <span className="flex items-center gap-1.5"><span className="text-lg">🏛️</span> Centro / Escuela</span>
        <span className="flex items-center gap-1.5"><span className="text-lg">🪷</span> Clase Específica</span>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-foreground/50">
            {filteredTeachers.length} resultado{filteredTeachers.length !== 1 ? "s" : ""} encontrado{filteredTeachers.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => {
              const profile = teacher.profiles;
              const isSchool = teacher.teacher_type === "escuela";
              
              return (
                <Link
                  key={teacher.id}
                  href={`/profesores/${teacher.id}`}
                  className="group relative rounded-2xl border border-brand-100/50 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 dark:border-surface-dark-alt dark:bg-surface-dark-alt/50 dark:hover:border-brand-800"
                >
                  <div className="absolute right-4 top-4 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                    {isSchool ? "Centro" : "Profesor"}
                  </div>
                  
                  {/* Avatar */}
                  <div className="mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-3xl font-bold text-white shadow-lg shadow-brand-500/20">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "Profesor"}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      (profile?.full_name?.[0] || "Y").toUpperCase()
                    )}
                  </div>

                  <h3 className="mt-4 text-center text-lg font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {profile?.full_name || "Profesor"}
                  </h3>

                  {teacher.address && (
                    <p className="mt-1 text-center text-sm text-foreground/50">
                      📍 {teacher.address}
                    </p>
                  )}

                  {teacher.average_price != null && Number(teacher.average_price) > 0 && (
                    <p className="mt-1 text-center text-sm font-medium text-brand-600 dark:text-brand-400">
                      Desde ${Number(teacher.average_price).toLocaleString("es-AR")}
                    </p>
                  )}

                  {teacher.specialties && teacher.specialties.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {teacher.specialties.slice(0, 4).map((spec: string) => (
                        <span
                          key={spec}
                          className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                        >
                          {spec}
                        </span>
                      ))}
                      {teacher.specialties.length > 4 && (
                        <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs text-foreground/40 dark:bg-surface-dark-alt">
                          +{teacher.specialties.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {teacher.bio && (
                    <p className="mt-4 line-clamp-2 text-center text-sm leading-relaxed text-foreground/60">
                      {teacher.bio}
                    </p>
                  )}

                  <span className="mt-4 block text-center text-xs font-medium text-brand-500 opacity-0 transition-opacity group-hover:opacity-100">
                    Ver perfil →
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mt-16 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl dark:bg-brand-900/30">
            🪷
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {teachers.length === 0
              ? "Aún no hay registros"
              : "No se encontraron resultados"}
          </h3>
          <p className="mt-2 text-sm text-foreground/60">
            Probá con otros filtros.
          </p>
        </div>
      )}
    </section>
  );
}
