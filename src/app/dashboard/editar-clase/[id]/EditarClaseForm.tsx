"use client";

import { useActionState, useState } from "react";
import { updateClass, type ClassState } from "@/lib/actions/classes";
import type { YogaClass } from "@/lib/database.types";

function toDatetimeLocalValue(isoString: string): string {
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function EditarClaseForm({
  yogaClass,
}: {
  yogaClass: YogaClass;
}) {
  const [state, formAction, pending] = useActionState<ClassState, FormData>(
    updateClass,
    {}
  );

  const [updateSeries, setUpdateSeries] = useState(false);
  
  // Capacity & Modality States
  const [showPresential, setShowPresential] = useState((yogaClass.capacity_presential ?? 0) > 0);
  const [showOnline, setShowOnline] = useState((yogaClass.capacity_online ?? 0) > 0);
  const [capPres, setCapPres] = useState(yogaClass.capacity_presential ?? 0);
  const [capOnline, setCapOnline] = useState(yogaClass.capacity_online ?? 0);
  const MAX_TOTAL = 20;

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
    <form action={formAction} className="space-y-6 pb-10">
      <input type="hidden" name="class_id" value={yogaClass.id} />
      <input type="hidden" name="update_series" value={String(updateSeries)} />

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      {yogaClass.series_id && (
        <div className="rounded-2xl bg-brand-500/10 p-5 border border-brand-500/20">
          <p className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Esta clase es parte de una serie</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUpdateSeries(false)}
              className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${!updateSeries ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white/5 text-white/40 border border-white/5'}`}
            >
              Solo esta
            </button>
            <button
              type="button"
              onClick={() => setUpdateSeries(true)}
              className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${updateSeries ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white/5 text-white/40 border border-white/5'}`}
            >
              Toda la serie
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Título de la clase *
          </label>
          <input
            type="text" id="title" name="title" required
            defaultValue={yogaClass.title}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Precio (ARS)
          </label>
          <input
            type="number" id="price" name="price" min="0" step="0.01"
            defaultValue={yogaClass.price}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scheduled_at" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Fecha y hora *
          </label>
          <input
            type="datetime-local" id="scheduled_at" name="scheduled_at" required
            defaultValue={toDatetimeLocalValue(yogaClass.scheduled_at)}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
        <div>
          <label htmlFor="jitsi_room_link" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Link de sala Zoom/Meet
          </label>
          <input
            type="url" id="jitsi_room_link" name="jitsi_room_link"
            defaultValue={yogaClass.jitsi_room_link || ""}
            placeholder="https://meet.jit.si/..."
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
      </div>

      {/* CAPACITY REDESIGN */}
      <div className="rounded-2xl bg-brand-500/5 p-6 border border-brand-500/10 space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Cupos de la Clase</label>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${isOverLimit ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-500/20 text-brand-400'}`}>
              TOTAL: {totalCapacity} / {MAX_TOTAL}
            </span>
            {isOverLimit && (
              <span className="text-[9px] text-red-400 font-bold mt-1 uppercase">Límite superado (máx 20)</span>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Presential Toggle */}
          <div className={`rounded-xl p-4 border transition-all ${showPresential ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface-dark/40 border-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/80">📍 Presencial</span>
              <button
                type="button"
                onClick={() => setShowPresential(!showPresential)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${showPresential ? 'bg-brand-500' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${showPresential ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {showPresential && (
              <input
                type="number" id="capacity_presential" name="capacity_presential" 
                min="0" max={MAX_TOTAL}
                value={capPres}
                onChange={(e) => handlePresChange(parseInt(e.target.value))}
                className="w-full rounded-lg border border-brand-500/30 bg-surface-dark/50 px-3 py-2 text-sm text-foreground focus:border-brand-500 focus:outline-none"
              />
            )}
            <input type="hidden" name="capacity_presential" value={showPresential ? capPres : 0} />
          </div>

          {/* Online Toggle */}
          <div className={`rounded-xl p-4 border transition-all ${showOnline ? 'bg-brand-500/10 border-brand-500/30' : 'bg-surface-dark/40 border-white/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/80">💻 Online</span>
              <button
                type="button"
                onClick={() => setShowOnline(!showOnline)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${showOnline ? 'bg-brand-500' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${showOnline ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {showOnline && (
              <input
                type="number" id="capacity_online" name="capacity_online" 
                min="0" max={MAX_TOTAL}
                value={capOnline}
                onChange={(e) => handleOnlineChange(parseInt(e.target.value))}
                className="w-full rounded-lg border border-brand-500/30 bg-surface-dark/50 px-3 py-2 text-sm text-foreground focus:border-brand-500 focus:outline-none"
              />
            )}
            <input type="hidden" name="capacity_online" value={showOnline ? capOnline : 0} />
          </div>
        </div>
      </div>

      <button
        type="submit" disabled={pending || isOverLimit}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
