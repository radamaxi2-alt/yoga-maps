"use client";

import { APIProvider, Map, InfoWindow, useMarkerRef, Marker } from "@vis.gl/react-google-maps";
import Link from "next/link";
import React, { memo, Suspense } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

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

const getCategoryEmoji = (category: string | null) => {
  switch (category) {
    case "retiro": return "🏕️";
    case "armonizacion": return "🔔";
    case "formacion": return "🎓";
    default: return "🧘";
  }
};

// --- Teacher Marker Component ---
const TeacherMarker = memo(({
  teacher,
  isSelected,
  onSelect,
}: {
  teacher: TeacherWithProfile;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [markerRef, marker] = useMarkerRef();
  const name = teacher.profiles?.full_name || "Profesor";
  const isSchool = teacher.teacher_type === "escuela";

  return (
    <React.Fragment key={`teacher-${teacher.id}`}>
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
            <Link
              href={`/profesores/${teacher.id}`}
              className="mt-2 inline-block text-xs font-bold text-brand-600 underline"
            >
              Ver perfil →
            </Link>
          </div>
        </InfoWindow>
      )}
    </React.Fragment>
  );
});

TeacherMarker.displayName = "TeacherMarker";

// --- Class Marker Component ---
const ClassMarker = memo(({
  cls,
  isSelected,
  onSelect,
}: {
  cls: ClassForMap;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [markerRef, marker] = useMarkerRef();
  const emoji = getCategoryEmoji(cls.category);

  return (
    <React.Fragment key={`class-${cls.id}`}>
      <Marker
        ref={markerRef}
        position={{ lat: cls.latitude!, lng: cls.longitude! }}
        onClick={onSelect}
        title={cls.title}
        label={{ text: emoji, className: "text-lg" }}
      />
      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => onSelect()}>
          <div className="max-w-[200px] p-1 font-sans">
            <div className="flex items-center gap-1 mb-1">
              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                {cls.category || "Clase"}
              </span>
            </div>
            <p className="font-bold text-gray-900">{cls.title}</p>
            <Link
              href={`/profesores/${cls.teacher_id}`}
              className="mt-2 inline-block text-xs font-medium text-brand-600 underline"
            >
              Ver detalles →
            </Link>
          </div>
        </InfoWindow>
      )}
    </React.Fragment>
  );
});

ClassMarker.displayName = "ClassMarker";

export default function YogaMap({
  mappableTeachers,
  filteredClasses,
  mapCenter,
  selectedMarkerId,
  onMarkerSelect,
}: {
  mappableTeachers: TeacherWithProfile[];
  filteredClasses: ClassForMap[];
  mapCenter: { lat: number; lng: number };
  selectedMarkerId: string | null;
  onMarkerSelect: (id: string) => void;
}) {
  if (!API_KEY || API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") return null;

  return (
    <Suspense fallback={
      <div className="h-[450px] w-full animate-pulse rounded-2xl bg-brand-50 flex items-center justify-center">
        <span className="text-brand-300 font-medium">Cargando mapa...</span>
      </div>
    }>
      <APIProvider apiKey={API_KEY}>
        <Map
          key={`${mapCenter.lat}-${mapCenter.lng}`}
          defaultCenter={mapCenter}
          defaultZoom={12}
          style={{ width: "100%", height: "450px" }}
          disableDefaultUI={true}
          zoomControl={true}
          gestureHandling={"greedy"}
          mapId={"YOGA_MAP_ID"}
        >
          {mappableTeachers.map((t) => (
            <TeacherMarker
              key={t.id}
              teacher={t}
              isSelected={selectedMarkerId === t.id}
              onSelect={() => onMarkerSelect(t.id)}
            />
          ))}
          {filteredClasses.map((c) => (
            <ClassMarker
              key={c.id}
              cls={c}
              isSelected={selectedMarkerId === c.id}
              onSelect={() => onMarkerSelect(c.id)}
            />
          ))}
        </Map>
      </APIProvider>
    </Suspense>
  );
}
