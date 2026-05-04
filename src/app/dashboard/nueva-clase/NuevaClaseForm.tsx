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

const CATEGORIES = [
  { id: "clase", label: "Clase" },
  { id: "retiro", label: "Retiro" },
  { id: "formación", label: "Formación" },
  { id: "armonización", label: "Armonización" },
  { id: "taller", label: "Taller" },
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
    <form action={formAction} className="max-w-4xl mx-auto space-y-8 pb-32">
      {state.error && (
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            {state.error}
          </div>
        </div>
      )}

      {/* SECTION 1: INFORMACIÓN BÁSICA */}
      <section className="glass rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="text-8xl font-black">01</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-sm">1</span>
          Información Básica
        </h2>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label htmlFor="category" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Categoría</label>
            <select
              id="category" name="category" required
              className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="title" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Nombre de la Actividad</label>
            <input
              type="text" id="title" name="title" required
              placeholder="Ej: Ashtanga Dinámico"
              className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="style_select" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Tipo de Yoga</label>
            <select
              id="style_select" name="style_select" required
              value={styleSelect}
              onChange={(e) => setStyleSelect(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            >
              <option value="">Selecciona un estilo</option>
              {YOGA_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {styleSelect === "Otro" && (
            <div className="sm:col-span-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <label htmlFor="custom_style" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Estilo Personalizado</label>
              <input
                type="text" id="custom_style" name="custom_style" required
                placeholder="Escribe el estilo..."
                className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Descripción de la práctica</label>
            <textarea
              id="description" name="description" rows={3}
              placeholder="Contanos de qué se trata la clase, qué van a trabajar..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: PROGRAMACIÓN Y LOGÍSTICA */}
      <section className="glass rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="text-8xl font-black">02</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-sm">2</span>
          Programación y Logística
        </h2>

        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="scheduled_at" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Fecha y Hora de Inicio</label>
              <input
                type="datetime-local" id="scheduled_at" name="scheduled_at" required
                className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>

            <div className="flex flex-col justify-end pb-1">
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isRecurring ? 'bg-brand-500/10 border-brand-500/30' : 'bg-white/5 border-white/5'}`}>
                <input 
                  type="checkbox" id="is_recurring" name="is_recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-surface-dark text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="is_recurring" className="text-xs font-bold text-white uppercase tracking-wider cursor-pointer">Repetir esta clase semanalmente</label>
              </div>
            </div>
          </div>

          {isRecurring && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <p className="mb-4 text-[10px] font-black text-brand-400 uppercase tracking-widest text-center">Días de repetición</p>
                <div className="flex justify-center gap-3">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`h-12 w-12 rounded-2xl text-xs font-black transition-all ${selectedDays.includes(day.id) ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-110' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="repeat_days" value={selectedDays.join(',')} />
              </div>

              <div>
                <label htmlFor="repeat_until" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">¿Hasta qué fecha repetir?</label>
                <input
                  type="date" id="repeat_until" name="repeat_until"
                  value={repeatUntil}
                  onChange={(e) => setRepeatUntil(e.target.value)}
                  required={isRecurring}
                  className="w-full rounded-xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="address_display" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Lugar / Dirección (Sede)</label>
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
                  placeholder="Ej: Palermo, Mar del Plata"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 outline-none transition-all"
                />
              )}
              <input type="hidden" name="address" value={address} />
              <input type="hidden" name="latitude" value={lat || ""} />
              <input type="hidden" name="longitude" value={lng || ""} />
            </div>

            {showOnline && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                <label htmlFor="jitsi_room_link" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">URL de Clase Online (Zoom/Meet)</label>
                <input
                  type="url" id="jitsi_room_link" name="jitsi_room_link"
                  placeholder="https://zoom.us/j/..."
                  className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 outline-none transition-all"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: MODALIDAD Y CAPACIDAD */}
      <section className="glass rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="text-8xl font-black">03</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-sm">3</span>
            Modalidad y Capacidad
          </h2>
          <div className="flex flex-col items-end">
            <div className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${isOverLimit ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'}`}>
              CUPOS TOTALES: {totalCapacity} / {MAX_TOTAL}
            </div>
            {isOverLimit && <span className="text-[10px] text-red-400 font-bold mt-1.5 uppercase tracking-tighter">Límite máximo de 20 personas superado</span>}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Presential Toggle */}
          <div className={`rounded-[2rem] p-6 transition-all border ${showPresential ? 'bg-brand-500/10 border-brand-500/40' : 'bg-white/5 border-white/5'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">📍 Ofrece modalidad Presencial?</span>
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-0.5">En sala física</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPresential(!showPresential)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${showPresential ? 'bg-brand-500' : 'bg-white/10'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${showPresential ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {showPresential && (
              <div className="animate-in zoom-in-95 duration-200">
                <label htmlFor="capacity_presential" className="mb-2 block text-[10px] font-black text-brand-400 uppercase tracking-widest">Cupo Sala</label>
                <input
                  type="number" id="capacity_presential" name="capacity_presential" 
                  min="0" max={MAX_TOTAL}
                  value={capPres}
                  onChange={(e) => handlePresChange(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-surface-dark/80 px-4 py-3 text-sm text-foreground focus:border-brand-500 outline-none"
                />
              </div>
            )}
            <input type="hidden" name="capacity_presential" value={showPresential ? capPres : 0} />
          </div>

          {/* Online Toggle */}
          <div className={`rounded-[2rem] p-6 transition-all border ${showOnline ? 'bg-brand-500/10 border-brand-500/40' : 'bg-white/5 border-white/5'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">💻 Ofrece modalidad Online?</span>
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-0.5">Vía Zoom / Meet</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOnline(!showOnline)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${showOnline ? 'bg-brand-500' : 'bg-white/10'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${showOnline ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {showOnline && (
              <div className="animate-in zoom-in-95 duration-200">
                <label htmlFor="capacity_online" className="mb-2 block text-[10px] font-black text-brand-400 uppercase tracking-widest">Cupo Zoom</label>
                <input
                  type="number" id="capacity_online" name="capacity_online" 
                  min="0" max={MAX_TOTAL}
                  value={capOnline}
                  onChange={(e) => handleOnlineChange(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-surface-dark/80 px-4 py-3 text-sm text-foreground focus:border-brand-500 outline-none"
                />
              </div>
            )}
            <input type="hidden" name="capacity_online" value={showOnline ? capOnline : 0} />
          </div>
        </div>
      </section>

      {/* SECTION 4: INVERSIÓN */}
      <section className="glass rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="text-8xl font-black">04</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-sm">4</span>
          Inversión
        </h2>
        
        <div className="max-w-xs">
          <label htmlFor="price" className="mb-2 block text-xs font-black text-brand-400 uppercase tracking-widest">Precio por persona ($)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
            <input
              type="number" id="price" name="price" min="0" step="0.01" defaultValue="0"
              className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 pl-8 pr-4 py-4 text-xl font-bold text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* SUBMIT BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface-dark/80 backdrop-blur-2xl border-t border-white/5 z-50">
        <div className="max-w-4xl mx-auto">
          <button
            type="submit" disabled={pending || isOverLimit}
            className={`w-full rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:scale-[1.01] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${pending ? 'animate-pulse' : ''}`}
          >
            {pending ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publicando...
              </span>
            ) : "Publicar Clase / Evento"}
          </button>
        </div>
      </div>
    </form>
  );
}
