"use client";

import { useRef, useEffect, useState, useCallback, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { updateTeacherProfile, uploadTeacherCover, uploadTeacherAvatar, type ProfileData } from "@/lib/actions/profile";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TeacherDetail } from "@/lib/database.types";
import Link from "next/link";
import { YOGA_SPECIALTIES } from "@/lib/constants";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

function PlacesAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
}: {
  value: string;
  onChange: (val: string) => void;
  onPlaceSelect: (address: string, lat: number, lng: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location && place.formatted_address) {
        onPlaceSelect(
          place.formatted_address,
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
      }
    });
  }, [places, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Empezá a escribir tu dirección..."
      className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
    />
  );
}

type FormValues = {
  teacher_type: "independiente" | "escuela";
  full_name: string;
  bio: string;
  specialties: string[];
  average_price: number | "";
  address: string;
  cover_image: string;
  avatar_url: string;
  cover_position: number;
};

export default function ProfileEditForm({
  fullName,
  avatarUrl,
  coverPosition,
  details,
}: {
  fullName: string;
  avatarUrl: string;
  coverPosition: number;
  details: TeacherDetail | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [lat, setLat] = useState(details?.latitude || 0);
  const [lng, setLng] = useState(details?.longitude || 0);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      teacher_type: (details?.teacher_type as "independiente" | "escuela") || "independiente",
      full_name: fullName || "",
      bio: details?.bio || "",
      specialties: details?.specialties || [],
      average_price: details?.average_price || "",
      address: details?.address || "",
      cover_image: details?.cover_image || "",
      avatar_url: avatarUrl || "",
      cover_position: coverPosition || 50,
    },
  });

  const selectedType = watch("teacher_type");
  const currentCover = watch("cover_image");
  const currentAvatar = watch("avatar_url");
  const currentPos = watch("cover_position");

  const onSubmit = (data: FormValues) => {
    setErrorMsg("");
    startTransition(async () => {
      const payload: ProfileData = {
        teacher_type: data.teacher_type,
        full_name: data.full_name,
        bio: data.bio || null,
        specialties: data.specialties,
        average_price: data.average_price === "" ? null : Number(data.average_price),
        address: data.address || null,
        latitude: lat || null,
        longitude: lng || null,
        cover_image: data.cover_image || null,
        avatar_url: data.avatar_url || null,
        cover_position: data.cover_position,
      };

      const result = await updateTeacherProfile(payload);
      if (result?.error) setErrorMsg(result.error);
    });
  };

  const hasApiKey = API_KEY && API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-brand-400 transition-colors">
        ← Volver al dashboard
      </Link>

      <div className="mt-6 rounded-[3rem] border border-white/5 bg-surface-dark-alt/40 p-10 shadow-2xl backdrop-blur-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Configuración Visual</h1>
          <p className="mt-2 text-sm text-brand-100/40 font-medium">Personalizá cómo te ven tus alumnos.</p>
        </div>
        
        {errorMsg && <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-shake">{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-12">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <div className="relative h-32 w-32 shrink-0">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-brand-500/20 bg-white/5 shadow-2xl ring-4 ring-white/5 transition-transform group-hover:scale-105">
                  {currentAvatar ? (
                    <img src={currentAvatar} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">🧘</div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 rounded-full bg-brand-500 p-2 shadow-lg">📸</div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-brand-400 uppercase tracking-widest">Foto de Perfil</label>
                  <div className="group relative">
                    <span className="cursor-help text-xs opacity-40">ⓘ</span>
                    <div className="absolute left-0 top-6 hidden w-48 rounded-xl bg-surface-dark-alt p-3 text-[10px] text-white/70 shadow-2xl group-hover:block z-50 border border-white/10">
                      Recomendado: <b>500 x 500px</b> (1:1). Ideal para que tu cara se vea bien en el mapa.
                    </div>
                  </div>
                </div>
                <input
                  type="file" accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    const result = await uploadTeacherAvatar(formData);
                    if (result.url) setValue("avatar_url", result.url);
                  }}
                  className="block w-full text-[10px] text-white/40 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-brand-500/10 file:text-brand-400 hover:file:bg-brand-500/20 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Cover Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-brand-400 uppercase tracking-widest">Foto de Portada</label>
                <div className="group relative">
                  <span className="cursor-help text-xs opacity-40">ⓘ</span>
                  <div className="absolute left-0 top-6 hidden w-64 rounded-xl bg-surface-dark-alt p-3 text-[10px] text-white/70 shadow-2xl group-hover:block z-50 border border-white/10">
                    Recomendado: <b>1200 x 400px</b> (Panorámico). Es la primera impresión de tu perfil.
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 shadow-2xl group">
              {currentCover ? (
                <img 
                  src={currentCover} 
                  className="h-full w-full object-cover transition-all duration-300" 
                  style={{ objectPosition: `center ${currentPos}%` }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/10 text-xl font-bold italic uppercase tracking-widest">Sin Portada</div>
              )}
              {currentCover && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Ajustá el encuadre con el slider ↓</p>
                </div>
              )}
            </div>

            {currentCover && (
              <div className="space-y-3 px-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">Ajuste Vertical ({currentPos}%)</label>
                  <button type="button" onClick={() => setValue("cover_position", 50)} className="text-[10px] font-bold text-brand-400 hover:text-white transition-colors">Resetear Centro</button>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  {...register("cover_position")}
                  className="w-full accent-brand-500 bg-white/5 rounded-full h-2 appearance-none cursor-pointer"
                />
              </div>
            )}

            <input
              type="file" accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                const result = await uploadTeacherCover(formData);
                if (result.url) setValue("cover_image", result.url);
              }}
              className="block w-full text-[10px] text-white/40 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-brand-500/10 file:text-brand-400 hover:file:bg-brand-500/20 transition-all cursor-pointer"
            />
          </div>

          <div className="space-y-8 pt-6 border-t border-white/5">
            <div>
              <label className="mb-2 block text-[10px] font-black text-white/40 uppercase tracking-widest">Nombre del Perfil</label>
              <input {...register("full_name")} className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black text-white/40 uppercase tracking-widest">Tu Bio</label>
              <textarea {...register("bio")} rows={4} className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none" />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black text-white/40 uppercase tracking-widest">Dirección Principal</label>
              {hasApiKey ? (
                <APIProvider apiKey={API_KEY}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <PlacesAutocompleteInput
                        value={field.value}
                        onChange={field.onChange}
                        onPlaceSelect={(addr, lat, lng) => {
                          setValue("address", addr);
                          setLat(lat);
                          setLng(lng);
                        }}
                      />
                    )}
                  />
                </APIProvider>
              ) : (
                <input {...register("address")} className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
              )}
            </div>
          </div>

          <button
            type="submit" disabled={isPending}
            className="w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 py-5 text-xs font-black text-white shadow-2xl shadow-brand-500/20 hover:-translate-y-1 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            {isPending ? "Procesando..." : "Guardar Configuración"}
          </button>
        </form>
      </div>
    </section>
  );
}
