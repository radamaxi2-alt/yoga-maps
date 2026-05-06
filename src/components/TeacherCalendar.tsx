"use client";

import React, { useState, useMemo } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  parseISO,
  isPast,
  isToday
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Users, MapPin, Video, Filter, Edit2, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import DeleteClassButton from "@/app/dashboard/DeleteClassButton";

interface ClassEvent {
  id: string;
  title: string;
  scheduled_at: string;
  category: string | null;
  capacity_presential: number | null;
  capacity_online: number | null;
  class_reservations: any[];
}

interface Props {
  classes: ClassEvent[];
}

export default function TeacherCalendar({ classes }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<ClassEvent | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(classes.map(c => c.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (filter === "all") return classes;
    return classes.filter(c => c.category === filter);
  }, [classes, filter]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-6">
      {/* Calendar Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass rounded-[2rem] p-6 border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black text-white capitalize min-w-[200px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat as string}
              onClick={() => setFilter(cat as string)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'}`}
            >
              {cat === "all" ? "Todos" : cat as string}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
          {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-brand-400 uppercase tracking-widest border-r border-white/5 last:border-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayClasses = filteredClasses.filter(c => isSameDay(parseISO(c.scheduled_at), day));
            const isSelectedMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={day.toString()} 
                className={`min-h-[140px] p-2 border-r border-b border-white/5 last:border-r-0 relative transition-all ${!isSelectedMonth ? 'bg-black/20 opacity-20' : 'hover:bg-white/5'}`}
              >
                <div className={`text-[11px] font-black mb-2 flex items-center justify-center h-6 w-6 rounded-full transition-all ${isToday(day) ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-white/40'}`}>
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {dayClasses.map(cls => {
                    const time = format(parseISO(cls.scheduled_at), "HH:mm");
                    const hasOnline = (cls.capacity_online ?? 0) > 0;
                    const hasPresential = (cls.capacity_presential ?? 0) > 0;
                    
                    return (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls)}
                        className={`w-full text-left p-1.5 rounded-lg text-[9px] font-bold transition-all hover:scale-[1.02] border ${hasOnline && hasPresential ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200' : hasOnline ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'bg-brand-500/10 border-brand-500/20 text-brand-200'}`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="opacity-60">{time}hs</span>
                          <div className="flex gap-0.5">
                            {hasPresential && <span className="text-[7px]">📍</span>}
                            {hasOnline && <span className="text-[7px]">💻</span>}
                          </div>
                        </div>
                        <div className="truncate uppercase tracking-tighter">{cls.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Details Drawer */}
      <AnimatePresence>
        {selectedClass && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClass(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-dark border-l border-white/10 z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full ring-1 ring-brand-500/30 uppercase tracking-widest">
                  {selectedClass.category || "Clase"}
                </span>
                <button 
                  onClick={() => setSelectedClass(null)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-3xl font-black text-white leading-tight mb-2">{selectedClass.title}</h3>
              <p className="text-brand-100/50 font-medium mb-8">
                {format(parseISO(selectedClass.scheduled_at), "EEEE d 'de' MMMM, HH:mm'hs'", { locale: es })}
              </p>

              {/* Stats Card */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={12} className="text-brand-400" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cupo Sala</span>
                  </div>
                  <p className="text-xl font-black text-white">
                    {selectedClass.class_reservations.filter(r => r.modality === 'presential').length} / {selectedClass.capacity_presential ?? 0}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Video size={12} className="text-cyan-400" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cupo Zoom</span>
                  </div>
                  <p className="text-xl font-black text-white">
                    {selectedClass.class_reservations.filter(r => r.modality === 'online').length} / {selectedClass.capacity_online ?? 0}
                  </p>
                </div>
              </div>

              {/* Student List */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <Users size={16} className="text-brand-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Alumnos Inscriptos</h4>
                </div>

                <div className="space-y-3">
                  {selectedClass.class_reservations.length > 0 ? (
                    selectedClass.class_reservations.map((res) => (
                      <div key={res.id} className={`flex items-center justify-between p-4 rounded-2xl border ${res.modality === 'online' ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-brand-500/5 border-brand-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center font-bold text-white uppercase overflow-hidden">
                            {res.profiles?.avatar_url ? (
                              <img src={res.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : res.profiles?.full_name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{res.profiles?.full_name}</p>
                            <span className={`text-[9px] font-black uppercase ${res.modality === 'online' ? 'text-cyan-400' : 'text-brand-400'}`}>
                              {res.modality === 'online' ? '💻 Online' : '📍 Sala'}
                            </span>
                          </div>
                        </div>
                        {res.profiles?.student_details?.health_info && (
                          <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" title="Alerta Médica" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-xs font-medium text-white/30 italic">No hay alumnos inscriptos aún</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 bg-surface-dark pt-6 border-t border-white/10 flex gap-4">
                <Link
                  href={`/dashboard/editar-clase/${selectedClass.id}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                >
                  <Edit2 size={14} /> Editar Clase
                </Link>
                <div className="flex-1">
                  <DeleteClassButton classId={selectedClass.id} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
