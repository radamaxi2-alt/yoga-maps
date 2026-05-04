"use client";

import { useActionState, useState, useEffect } from "react";
import { createClass, type ClassState } from "@/lib/actions/classes";
import { APIProvider } from "@vis.gl/react-google-maps";
import PlacesAutocompleteInput from "@/components/PlacesAutocompleteInput";

const YOGA_SPECIALTIES = [
  "Hatha Yoga",
  "Vinyasa Flow",
  "Ashtanga",
  "Yin Yoga",
  "Kundalini",
  "Yoga Nidra",
  "Iyengar",
  "Restaurativo",
  "Pranayama",
  "Meditación",
  "Otro"
];

const DAYS_OF_WEEK = [
  { id: 1, label: "LU" },
  { id: 2, label: "MA" },
  { id: 3, label: "MI" },
  { id: 4, label: "JU" },
  { id: 5, label: "VI" },
  { id: 6, label: "SA" },
  { id: 0, label: "DO" },
];

export default function NuevaClaseForm() {
  const [state, formAction, pending] = useActionState<ClassState, FormData>(
    createClass,
    {}
  );

  const [styleSelect, setStyleSelect] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Capacity & Modality States
  const [showPresential, setShowPresential] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const [capPres, setCapPres] = useState(0);
  const [capOnline, setCapOnline] = useState(0);
  const MAX_TOTAL = 20;

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [repeatUntil, setRepeatUntil] = useState("");

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const hasApiKey = !!API_KEY;

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
  };

  const handlePresChange = (val: number) => {
    const num = isNaN(val) ? 0 : val;
    setCapPres(num);
  };

  const handleOnlineChange = (val: number) => {
    const num = isNaN(val) ? 0 : val;
    setCapOnline(num);
  };

  const totalCapacity = (showPresential ? capPres : 0) + (showOnline ? capOnline : 0);
  const isOverLimit = totalCapacity > MAX_TOTAL;

  return (
    <form action={formAction} className="space-y-8 pb-20">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 animate-in fade-in zoom-in duration-300">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Título de la clase *
          </label>
          <input
            type="text" id="title" name="title" required
            placeholder="Ej: Hatha Flow Intermedios"
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
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
          <div className="sm:col-span-2">
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

      <div className="grid gap-6 sm:grid-cols-2">
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

      {/* REDESIGNED CAPACITY SECTION */}
      <div className="rounded-3xl bg-brand-500/5 p-6 border border-brand-500/10 space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Configuración de Cupos</label>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full transition-all ${isOverLimit ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' : 'bg-brand-500/20 text-brand-400'}`}>
              TOTAL: {totalCapacity} / {MAX_TOTAL}
            </span>
            {isOverLimit && (
              <span className="text-[9px] text-red-400 font-bold mt-1 uppercase tracking-tighter">
                El límite total entre ambas modalidades es de 20 personas
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Presential Toggle & Input */}
          <div className={`rounded-2xl p-4 transition-all border ${showPresential ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface-dark/40 border-white/5'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-foreground/80">📍 Modalidad Presencial</span>
              <button
                type="button"
                onClick={() => setShowPresential(!showPresential)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showPresential ? 'bg-brand-500' : 'bg-white/10'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showPresential ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {showPresential && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label htmlFor="capacity_presential" className="mb-1.5 block text-[10px] font-black text-brand-400 uppercase">Lugares en Sala</label>
                <input
                  type="number" id="capacity_presential" name="capacity_presential" 
                  min="0" max={MAX_TOTAL}
                  value={capPres}
                  onChange={(e) => handlePresChange(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-brand-500/30 bg-surface-dark/50 px-4 py-2.5 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            )}
            <input type="hidden" name="capacity_presential" value={showPresential ? capPres : 0} />
          </div>

          {/* Online Toggle & Input */}
          <div className={`rounded-2xl p-4 transition-all border ${showOnline ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface-dark/40 border-white/5'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-foreground/80">💻 Modalidad Online</span>
              <button
                type="button"
                onClick={() => setShowOnline(!showOnline)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showOnline ? 'bg-brand-500' : 'bg-white/10'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showOnline ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {showOnline && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label htmlFor="capacity_online" className="mb-1.5 block text-[10px] font-black text-brand-400 uppercase">Lugares en Zoom/Meet</label>
                <input
                  type="number" id="capacity_online" name="capacity_online" 
                  min="0" max={MAX_TOTAL}
                  value={capOnline}
                  onChange={(e) => handleOnlineChange(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-brand-500/30 bg-surface-dark/50 px-4 py-2.5 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            )}
            <input type="hidden" name="capacity_online" value={showOnline ? capOnline : 0} />
          </div>
        </div>
      </div>

      {/* Recurrence Options */}
      <div className="rounded-3xl bg-brand-500/5 p-6 border border-brand-500/10">
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
          type="submit" disabled={pending || isOverLimit}
          className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Publicando..." : "Publicar Clase(s)"}
        </button>
      </div>
    </form>
  );
}
