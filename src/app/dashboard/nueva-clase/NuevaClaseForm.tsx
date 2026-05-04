"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { createClass, type ClassState } from "@/lib/actions/classes";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { YOGA_SPECIALTIES, EVENT_CATEGORIES } from "@/lib/constants";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const DAYS_OF_WEEK = [
  { id: "0", label: "Dom" },
  { id: "1", label: "Lun" },
  { id: "2", label: "Mar" },
  { id: "3", label: "Mié" },
  { id: "4", label: "Jue" },
  { id: "5", label: "Vie" },
  { id: "6", label: "Sáb" },
];

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

  // Capacities Logic
  const [capPres, setCapPres] = useState(15);
  const [capOnline, setCapOnline] = useState(5);
  const MAX_TOTAL = 20;

  // Recurrence Logic
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [repeatUntil, setRepeatUntil] = useState("");

  const handlePresChange = (val: number) => {
    const newPres = Math.min(val, MAX_TOTAL);
    setCapPres(newPres);
    if (newPres + capOnline > MAX_TOTAL) {
      setCapOnline(MAX_TOTAL - newPres);
    }
  };

  const handleOnlineChange = (val: number) => {
    const newOnline = Math.min(val, MAX_TOTAL);
    setCapOnline(newOnline);
    if (newOnline + capPres > MAX_TOTAL) {
      setCapPres(MAX_TOTAL - newOnline);
    }
  };

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const hasApiKey = API_KEY && API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <form action={formAction} className="space-y-6 pb-20">
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
            placeholder="Ej: Yoga para principiantes"
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
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
            Fecha y hora de inicio *
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
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
      </div>

      {/* Recurrence Options */}
      <div className="rounded-2xl bg-brand-500/5 p-6 border border-brand-500/10">
        <div className="flex items-center gap-3 mb-4">
          <input 
            type="checkbox" id="is_recurring" name="is_recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-5 w-5 rounded border-brand-500/30 bg-surface-dark text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="is_recurring" className="text-sm font-bold text-white uppercase tracking-wider">Repetir esta clase semanalmente</label>
        </div>

        {isRecurring && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <p className="mb-3 text-[10px] font-black text-brand-400 uppercase tracking-widest">¿Qué días se repite?</p>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`h-10 w-10 rounded-full text-[10px] font-black transition-all ${selectedDays.includes(day.id) ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="repeat_days" value={selectedDays.join(',')} />
            </div>

            <div>
              <label htmlFor="repeat_until" className="mb-1.5 block text-[10px] font-black text-brand-400 uppercase tracking-widest">¿Hasta qué fecha repetir?</label>
              <input
                type="date" id="repeat_until" name="repeat_until"
                value={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.value)}
                required={isRecurring}
                className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-brand-500/5 p-6 border border-brand-500/10">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Distribución de Cupos</label>
          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${capPres + capOnline >= MAX_TOTAL ? 'bg-red-500 text-white' : 'bg-brand-500/20 text-brand-400'}`}>
            TOTAL: {capPres + capOnline} / {MAX_TOTAL}
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="capacity_presential" className="mb-1.5 block text-xs font-bold text-white/60">
              📍 Presencial (SALA)
            </label>
            <input
              type="number" id="capacity_presential" name="capacity_presential" 
              min="0" max={MAX_TOTAL}
              value={capPres}
              onChange={(e) => handlePresChange(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>
          <div>
            <label htmlFor="capacity_online" className="mb-1.5 block text-xs font-bold text-white/60">
              💻 Online (ZOOM)
            </label>
            <input
              type="number" id="capacity_online" name="capacity_online" 
              min="0" max={MAX_TOTAL}
              value={capOnline}
              onChange={(e) => handleOnlineChange(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>
        </div>
        <p className="mt-3 text-[10px] text-white/40 italic">* La suma total de ambas modalidades no puede superar los 20 alumnos.</p>
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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-dark/80 backdrop-blur-md border-t border-white/5 sm:relative sm:bg-transparent sm:border-0 sm:p-0">
        <button
          type="submit" disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Publicando..." : "Publicar Clase(s)"}
        </button>
      </div>
    </form>
  );
}
