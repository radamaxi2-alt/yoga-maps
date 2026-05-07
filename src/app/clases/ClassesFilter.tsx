"use client";

import React from "react";
import { format, addDays, startOfToday, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ClassesFilterProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

export default function ClassesFilter({ selectedDate, onDateSelect }: ClassesFilterProps) {
  const today = startOfToday();
  const next7Days = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Filtrar por fecha</h3>
        {selectedDate && (
          <button 
            onClick={() => onDateSelect(null)}
            className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-widest"
          >
            Limpiar filtro
          </button>
        )}
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        {next7Days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(isSelected ? null : day)}
              className={`flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl border transition-all ${
                isSelected 
                  ? 'bg-brand-500 border-brand-400 shadow-lg shadow-brand-500/20 scale-105' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/40 hover:text-white'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-tighter mb-1 ${isSelected ? 'text-white/80' : ''}`}>
                {format(day, "EEE", { locale: es })}
              </span>
              <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-white/80'}`}>
                {format(day, "d")}
              </span>
              <span className={`text-[9px] font-medium ${isSelected ? 'text-white/60' : 'text-white/20'}`}>
                {format(day, "MMM", { locale: es })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
