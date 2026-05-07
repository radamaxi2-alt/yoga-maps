"use client";

import React from "react";
import { Calendar, Clock, X } from "lucide-react";

interface ClassesFilterProps {
  selectedDate: string; // "YYYY-MM-DD"
  onDateSelect: (date: string) => void;
  selectedTimeRange: string; // "all", "morning", "afternoon", "evening"
  onTimeRangeSelect: (range: string) => void;
}

export default function ClassesFilter({ 
  selectedDate, 
  onDateSelect, 
  selectedTimeRange, 
  onTimeRangeSelect 
}: ClassesFilterProps) {
  
  return (
    <div className="mb-12 glass rounded-[2.5rem] p-6 border border-white/5 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        
        {/* Date Selector */}
        <div className="flex-1 w-full">
          <label className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-2 block">
            Seleccionar Fecha
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => onDateSelect(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none font-bold"
            />
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex-1 w-full">
          <label className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mb-2 block">
            Rango Horario
          </label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <select 
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeSelect(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none font-bold cursor-pointer"
            >
              <option value="all" className="bg-surface-dark">Cualquier horario</option>
              <option value="morning" className="bg-surface-dark">Mañana (06:00 - 12:00)</option>
              <option value="afternoon" className="bg-surface-dark">Tarde (12:00 - 18:00)</option>
              <option value="evening" className="bg-surface-dark">Noche (18:00 - 23:59)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedDate || selectedTimeRange !== "all") && (
          <div className="md:pt-6">
            <button 
              onClick={() => {
                onDateSelect("");
                onTimeRangeSelect("all");
              }}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-white/5"
            >
              <X size={14} /> Limpiar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
