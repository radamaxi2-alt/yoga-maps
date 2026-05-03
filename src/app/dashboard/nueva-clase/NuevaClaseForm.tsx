"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { createClass, type ClassState } from "@/lib/actions/classes";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { YOGA_SPECIALTIES, EVENT_CATEGORIES } from "@/lib/constants";

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
  const [category, setCategory] = useState("clase");
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Categoría del Evento *
          </label>
          <select
            id="category" name="category" required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          >
            {EVENT_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Título *
          </label>
          <input
            type="text" id="title" name="title" required
            placeholder="Ej: Retiro Espiritual en la Sierra"
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
      </div>

      {category === "formacion" && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label htmlFor="certification_title" className="mb-1.5 block text-sm font-medium text-brand-600">
            Título que otorga la Formación
          </label>
          <input
            type="text" id="certification_title" name="certification_title" required
            placeholder="Ej: Instructor de Yoga Integral 200hs"
            className="w-full rounded-xl border border-brand-300 bg-brand-50/30 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
          />
        </div>
      )}

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
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Descripción
        </label>
        <textarea
          id="description" name="description" rows={3}
          placeholder="Describí qué van a trabajar..."
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Precio (ARS)
          </label>
          <input
            type="number" id="price" name="price" min="0" step="0.01" defaultValue="0"
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="capacity_presential" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-brand-600">
              Cupo SALA
            </label>
            <input
              type="number" id="capacity_presential" name="capacity_presential" min="0" defaultValue="15"
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>
          <div>
            <label htmlFor="capacity_online" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-cyan-600">
              Cupo ZOOM
            </label>
            <input
              type="number" id="capacity_online" name="capacity_online" min="0" defaultValue="5"
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="address_display" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Ubicación (Opcional)
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
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        )}
        <input type="hidden" name="address" value={address} />
        <input type="hidden" name="latitude" value={lat || ""} />
        <input type="hidden" name="longitude" value={lng || ""} />
      </div>

      <button
        type="submit" disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "Publicando..." : "Publicar Evento"}
      </button>
    </form>
  );
}
