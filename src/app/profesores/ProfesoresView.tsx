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

  return (
    <>
      <Marker
        ref={markerRef}
        position={{ lat: teacher.latitude!, lng: teacher.longitude! }}
        onClick={onSelect}
        title={name}
      />
      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => onSelect()}>
          <div className="max-w-[200px] p-1">
            <p className="font-semibold text-gray-900">{name}</p>
            {teacher.address && (
              <p className="mt-0.5 text-xs text-gray-500">📍 {teacher.address}</p>
            )}
            {teacher.specialties && teacher.specialties.length > 0 && (
              <p className="mt-1 text-xs text-gray-600">
                {teacher.specialties.slice(0, 3).join(", ")}
              </p>
            )}
            <Link
              href={`/profesores/${teacher.id}`}
              className="mt-2 inline-block text-xs font-medium text-green-600 hover:text-green-700"
            >
              Ver perfil →
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
}: {
  teachers: TeacherWithProfile[];
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
  const filtered = useMemo(() => {
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

  // Teachers with valid coordinates (for map)
  const mappable = useMemo(
    () => filtered.filter((t) => t.latitude && t.longitude),
    [filtered]
  );

  // Compute map center from filtered teachers
  const mapCenter = useMemo(() => {
    if (mappable.length === 0) return DEFAULT_CENTER;
    const avgLat =
      mappable.reduce((s, t) => s + t.latitude!, 0) / mappable.length;
    const avgLng =
      mappable.reduce((s, t) => s + t.longitude!, 0) / mappable.length;
    return { lat: avgLat, lng: avgLng };
  }, [mappable]);

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
          Profesores de Yoga
        </h1>
        <p className="mt-4 text-lg text-foreground/60">
          Descubrí profesores, filtrá por especialidad o ciudad, y explora el
          mapa.
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
            placeholder="Buscar por nombre o ciudad..."
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
      {hasApiKey && mappable.length > 0 && (
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
              {mappable.map((t) => (
                <TeacherMarker
                  key={t.id}
                  teacher={t}
                  isSelected={selectedMarkerId === t.id}
                  onSelect={() => handleMarkerSelect(t.id)}
                />
              ))}
            </Map>
          </APIProvider>
        </div>
      )}

      {hasApiKey && mappable.length === 0 && filtered.length > 0 && (
        <div className="mt-8 rounded-2xl border border-brand-100/40 bg-brand-50/30 p-6 text-center text-sm text-foreground/50 dark:border-surface-dark-alt dark:bg-surface-dark-alt/30">
          📍 Los profesores mostrados aún no cargaron su ubicación en el mapa.
        </div>
      )}

      {/* Teachers Grid */}
      {filtered.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-foreground/50">
            {filtered.length} profesor{filtered.length !== 1 ? "es" : ""}{" "}
            encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((teacher) => {
              const profile = teacher.profiles;
              return (
                <Link
                  key={teacher.id}
                  href={`/profesores/${teacher.id}`}
                  className="group rounded-2xl border border-brand-100/50 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 dark:border-surface-dark-alt dark:bg-surface-dark-alt/50 dark:hover:border-brand-800"
                >
                  {/* Avatar */}
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-3xl font-bold text-white shadow-lg shadow-brand-500/20">
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
              ? "Aún no hay profesores registrados"
              : "No se encontraron resultados"}
          </h3>
          <p className="mt-2 text-sm text-foreground/60">
            {teachers.length === 0 ? (
              <>
                ¿Sos profesor de yoga?{" "}
                <Link
                  href="/registro"
                  className="font-medium text-brand-600 hover:text-brand-500"
                >
                  Registrate y publicá tu perfil.
                </Link>
              </>
            ) : (
              "Probá con otros filtros."
            )}
          </p>
        </div>
      )}
    </section>
  );
}
