"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { createClass, type ClassState } from "@/lib/actions/classes";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

const YOGA_SPECIALTIES = [
  "Hatha", "Vinyasa", "Ashtanga", "Kundalini", "Iyengar", "Yin",
  "Restaurativo", "Power Yoga", "Bikram", "Meditación", "Pranayama", "Yoga Nidra",
  "Otro"
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
      placeholder="Ej: Palermo, Buenos Aires"
      className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
    />
  );
}

export default function NuevaClaseForm() {
  const [state, formAction, pending] = useActionState<ClassState, FormData>(
    createClass,
    {}
  );

  const [styleSelect, setStyleSelect] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const hasApiKey = API_KEY && API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Título de la clase *
        </label>
        <input
          type="text" id="title" name="title" required
          placeholder="Ej: Hatha Yoga para principiantes"
          className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="style_select" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Estilo de Yoga
          </label>
          <select
            id="style_select" name="style_select"
            value={styleSelect}
            onChange={(e) => setStyleSelect(e.target.value)}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          >
            <option value="">Selecciona un estilo</option>
            {YOGA_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {styleSelect === "Otro" && (
          <div>
            <label htmlFor="custom_style" className="mb-1.5 block text-sm font-medium text-foreground/80">
              Estilo personalizado
            </label>
            <input
              type="text" id="custom_style" name="custom_style" required
              placeholder="Escribe tu estilo..."
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>
        )}
        {styleSelect !== "Otro" && (
          <div>
            <label htmlFor="instructor_name" className="mb-1.5 block text-sm font-medium text-foreground/80">
              Profesor a cargo (Opcional)
            </label>
            <input
              type="text" id="instructor_name" name="instructor_name"
              placeholder="Si es un centro, ¿quién da la clase?"
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>
        )}
      </div>

      {styleSelect === "Otro" && (
        <div>
          <label htmlFor="instructor_name" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Profesor a cargo (Opcional)
          </label>
          <input
            type="text" id="instructor_name" name="instructor_name"
            placeholder="Si es un centro, ¿quién da la clase?"
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
      )}

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Descripción
        </label>
        <textarea
          id="description" name="description" rows={3}
          placeholder="Describí qué van a trabajar en la clase..."
          className="w-full resize-none rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scheduled_at" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Fecha y hora *
          </label>
          <input
            type="datetime-local" id="scheduled_at" name="scheduled_at" required
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Precio (ARS)
          </label>
          <input
            type="number" id="price" name="price" min="0" step="0.01" defaultValue="0"
            placeholder="0 = Gratis"
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="max_capacity" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Cupo Máximo Presencial
          </label>
          <input
            type="number" id="max_capacity" name="max_capacity" min="1"
            placeholder="Ej: 15"
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 dark:border-surface-dark-alt dark:bg-surface-dark/50">
          <label htmlFor="is_full" className="text-sm font-medium text-foreground/80">
            Marcar como 'Sala Llena'
          </label>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="is_full" id="is_full" className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-brand-800"></div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="address_display" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Ubicación de la clase (Opcional)
        </label>
        {hasApiKey ? (
          <APIProvider apiKey={API_KEY}>
            <PlacesAutocompleteInput
              value={address}
              onChange={setAddress}
              onPlaceSelect={(addr, lat, lng) => {
                setAddress(addr);
                setLat(lat);
                setLng(lng);
              }}
            />
          </APIProvider>
        ) : (
          <input
            type="text"
            id="address_display"
            placeholder="Ej: Palermo, Buenos Aires"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        )}
        <p className="mt-1.5 text-xs text-foreground/40">
          Dejalo vacío para usar la dirección principal de tu perfil.
        </p>
        <input type="hidden" name="address" value={address} />
        <input type="hidden" name="latitude" value={lat || ""} />
        <input type="hidden" name="longitude" value={lng || ""} />
      </div>

      <div>
        <label htmlFor="jitsi_room_link" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Link de sala Online (opcional)
        </label>
        <input
          type="url" id="jitsi_room_link" name="jitsi_room_link"
          placeholder="https://meet.jit.si/mi-clase-yoga o Zoom"
          className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
        />
        <p className="mt-1.5 text-xs text-foreground/40">
          Si la clase es online o híbrida, pegá acá el link de la sala.
        </p>
      </div>

      <button
        type="submit" disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Publicando..." : "Publicar Clase"}
      </button>
    </form>
  );
}
