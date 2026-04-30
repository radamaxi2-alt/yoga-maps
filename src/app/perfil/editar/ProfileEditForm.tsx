"use client";

import { useRef, useEffect, useState, useCallback, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { updateTeacherProfile, type ProfileData } from "@/lib/actions/profile";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TeacherDetail } from "@/lib/database.types";
import Link from "next/link";

const YOGA_SPECIALTIES = [
  "Hatha", "Vinyasa", "Ashtanga", "Kundalini", "Iyengar", "Yin",
  "Restaurativo", "Power Yoga", "Bikram", "Meditación", "Pranayama", "Yoga Nidra",
];

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
      className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
    />
  );
}

type FormValues = {
  full_name: string;
  bio: string;
  specialties: string[];
  average_price: number | "";
  address: string;
};

export default function ProfileEditForm({
  fullName,
  details,
}: {
  fullName: string;
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
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: fullName || "",
      bio: details?.bio || "",
      specialties: details?.specialties || [],
      average_price: details?.average_price || "",
      address: details?.address || "",
    },
  });

  const handlePlaceSelect = useCallback(
    (addr: string, latitude: number, longitude: number) => {
      setValue("address", addr, { shouldValidate: true });
      setLat(latitude);
      setLng(longitude);
    },
    [setValue]
  );

  const onSubmit = (data: FormValues) => {
    setErrorMsg("");
    startTransition(async () => {
      const payload: ProfileData = {
        full_name: data.full_name,
        bio: data.bio || null,
        specialties: data.specialties,
        average_price: data.average_price === "" ? null : Number(data.average_price),
        address: data.address || null,
        latitude: lat || null,
        longitude: lng || null,
      };

      const result = await updateTeacherProfile(payload);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  const hasApiKey = API_KEY && API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-foreground/50 transition-colors hover:text-brand-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al dashboard
      </Link>

      <div className="mt-6 rounded-2xl border border-brand-100/50 bg-white/70 p-8 shadow-xl shadow-brand-500/5 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark-alt/70">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Editar Perfil</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Actualizá tu información para que los alumnos te encuentren.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-foreground/80">
              Nombre completo
            </label>
            <input
              type="text" id="full_name"
              {...register("full_name", { required: "El nombre es obligatorio" })}
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-foreground/80">
              Sobre vos
            </label>
            <textarea
              id="bio" rows={4}
              {...register("bio")}
              placeholder="Contá sobre tu experiencia y formación..."
              className="w-full resize-none rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>

          {/* Specialties */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-foreground/80">
              Especialidades
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {YOGA_SPECIALTIES.map((spec) => (
                <label key={spec} className="group relative cursor-pointer">
                  <input
                    type="checkbox"
                    value={spec}
                    {...register("specialties")}
                    className="peer sr-only"
                  />
                  <div className="rounded-lg border border-brand-100/60 bg-surface-alt/30 px-3 py-2 text-center text-sm transition-all duration-200 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:font-medium peer-checked:text-brand-700 hover:border-brand-200 dark:border-surface-dark-alt dark:bg-surface-dark/30 dark:peer-checked:border-brand-500 dark:peer-checked:bg-brand-900/20 dark:peer-checked:text-brand-300">
                    {spec}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Average Price */}
          <div>
            <label htmlFor="average_price" className="mb-1.5 block text-sm font-medium text-foreground/80">
              Precio promedio de clase (ARS)
            </label>
            <input
              type="number" id="average_price"
              step="0.01"
              {...register("average_price", {
                min: { value: 0.01, message: "El precio debe ser mayor a 0" },
              })}
              placeholder="Ej: 5000"
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
            {errors.average_price && <p className="mt-1 text-xs text-red-500">{errors.average_price.message}</p>}
          </div>

          {/* Address with Google Places Autocomplete */}
          <div>
            <label htmlFor="address_display" className="mb-1.5 block text-sm font-medium text-foreground/80">
              Dirección / Ubicación
            </label>
            {hasApiKey ? (
              <APIProvider apiKey={API_KEY}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <PlacesAutocompleteInput
                      value={field.value}
                      onChange={field.onChange}
                      onPlaceSelect={handlePlaceSelect}
                    />
                  )}
                />
              </APIProvider>
            ) : (
              <input
                type="text"
                id="address_display"
                placeholder="Ej: Palermo, Buenos Aires"
                {...register("address")}
                className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
              />
            )}
            <p className="mt-1.5 text-xs text-foreground/40">
              {lat && lng
                ? `📍 Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
                : "Seleccioná una dirección del autocompletado para geolocalizarte."}
            </p>
          </div>

          <button
            type="submit" disabled={isPending}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar Perfil"}
          </button>
        </form>
      </div>
    </section>
  );
}
