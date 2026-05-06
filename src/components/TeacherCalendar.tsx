"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { 
  updateReservationStatus, 
  updateAttendance, 
  addCredits, 
  consumeClassCredits, 
  addManualReservation 
} from "@/lib/actions/reservations";
import { searchTeachers } from "@/lib/actions/classes";
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  MapPin, 
  Video, 
  Filter, 
  Edit2, 
  Trash2, 
  X,
  UserCheck,
  UserX,
  Coins,
  Plus
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  instructor_name?: string;
}

interface Props {
  classes: ClassEvent[];
}

export default function TeacherCalendar({ classes }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<ClassEvent | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Credit Modal
  const [showCreditModal, setShowCreditModal] = useState<{ studentId: string, name: string } | null>(null);
  const [creditAmount, setCreditAmount] = useState(1);

  // Manual Reservation States
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [manualResults, setManualResults] = useState<any[]>([]);
  const [guestName, setGuestName] = useState("");
  const [manualModality, setManualModality] = useState<'presential' | 'online'>('presential');

  const handleConfirmReservation = async (resId: string) => {
    setIsUpdating(resId);
    await updateReservationStatus(resId, "confirmed");
    setIsUpdating(null);
  };

  const handleAttendance = async (resId: string, attendance: 'present' | 'absent' | 'none') => {
    setIsUpdating(resId);
    await updateAttendance(resId, attendance);
    setIsUpdating(null);
  };

  const handleProcessCredits = async (classId: string) => {
    if (!confirm("¿Deseas descontar 1 crédito a todos los presentes? Esta acción no se puede deshacer.")) return;
    setIsUpdating(classId);
    await consumeClassCredits(classId);
    setIsUpdating(null);
    alert("Créditos procesados correctamente.");
  };

  const handleAddCredits = async () => {
    if (!showCreditModal) return;
    setIsUpdating(showCreditModal.studentId);
    await addCredits(showCreditModal.studentId, creditAmount);
    setIsUpdating(null);
    setShowCreditModal(null);
    setCreditAmount(1);
  };

  const handleManualAdd = async (studentId?: string) => {
    if (!selectedClass) return;
    if (!studentId && !guestName) return;
    
    setIsUpdating("manual");
    const res = await addManualReservation(selectedClass.id, manualModality, studentId, guestName);
    setIsUpdating(null);
    
    if (res.error) {
      alert(res.error);
    } else {
      setShowManualModal(false);
      setManualSearch("");
      setGuestName("");
      setManualResults([]);
      setSelectedClass(null);
    }
  };

  const copyProfileLink = () => {
    const url = `${window.location.origin}/profesores/${classes[0]?.instructor_name || 'me'}`;
    navigator.clipboard.writeText(url);
    alert("¡Link copiado al portapapeles!");
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (manualSearch.length >= 2) {
        const results = await searchTeachers(manualSearch);
        setManualResults(results);
      } else {
        setManualResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [manualSearch]);

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
          <button 
            onClick={copyProfileLink}
            className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all flex items-center gap-2"
          >
            📋 Copiar Link de Perfil
          </button>
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
                          <span className="opacity-60">{time}</span>
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
              <p className="text-brand-100/50 font-medium mb-4">
                {format(parseISO(selectedClass.scheduled_at), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
              </p>

              {isPast(parseISO(selectedClass.scheduled_at)) && (
                <button
                  onClick={() => handleProcessCredits(selectedClass.id)}
                  disabled={isUpdating === selectedClass.id}
                  className="w-full mb-8 rounded-2xl bg-brand-500/20 border border-brand-500/30 py-3 text-[10px] font-black text-brand-400 uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Coins size={14} /> {isUpdating === selectedClass.id ? "Procesando..." : "Procesar Asistencia y Créditos"}
                </button>
              )}

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
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cupo Online</span>
                  </div>
                  <p className="text-xl font-black text-white">
                    {selectedClass.class_reservations.filter(r => r.modality === 'online').length} / {selectedClass.capacity_online ?? 0}
                  </p>
                </div>
              </div>

              {/* Student List */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-brand-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Alumnos Inscriptos</h4>
                  </div>
                  <button 
                    onClick={() => setShowManualModal(true)}
                    className="text-[10px] font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={12} /> Agregar Alumno
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedClass.class_reservations.length > 0 ? (
                    selectedClass.class_reservations.map((res) => {
                      const isPending = res.status === 'pending';
                      const isPresent = res.attendance === 'present';
                      const isAbsent = res.attendance === 'absent';
                      
                      return (
                        <div key={res.id} className="space-y-2">
                          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isPending ? 'bg-amber-500/5 border-amber-500/20' : res.modality === 'online' ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-brand-500/5 border-brand-500/20'}`}>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center font-bold text-white uppercase overflow-hidden">
                                {res.profiles?.avatar_url ? (
                                  <img src={res.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : res.guest_name ? "G" : res.profiles?.full_name?.[0] || "?"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-white">{res.guest_name || res.profiles?.full_name}</p>
                                  {isPending && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black uppercase">Pendiente</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-black uppercase ${res.modality === 'online' ? 'text-cyan-400' : 'text-brand-400'}`}>
                                    {res.modality === 'online' ? '💻 Online' : '📍 Sala'}
                                  </span>
                                  {res.student_id && (
                                    <button 
                                      onClick={() => setShowCreditModal({ studentId: res.student_id, name: res.profiles?.full_name })}
                                      className="text-[8px] text-brand-300/60 hover:text-brand-300 font-bold flex items-center gap-1"
                                    >
                                      <Plus size={8} /> Cargar Abono
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {!res.guest_name && (
                              <div className="flex items-center gap-2">
                                {isPending ? (
                                  <button
                                    onClick={() => handleConfirmReservation(res.id)}
                                    disabled={isUpdating === res.id}
                                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-[9px] font-black text-brand-900 uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50"
                                  >
                                    {isUpdating === res.id ? '...' : 'Confirmar Pago'}
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleAttendance(res.id, isPresent ? 'none' : 'present')}
                                      disabled={isUpdating === res.id}
                                      className={`p-2 rounded-lg transition-all ${isPresent ? 'bg-green-500 text-white' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
                                      title="Presente"
                                    >
                                      <UserCheck size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleAttendance(res.id, isAbsent ? 'none' : 'absent')}
                                      disabled={isUpdating === res.id}
                                      className={`p-2 rounded-lg transition-all ${isAbsent ? 'bg-red-500 text-white' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
                                      title="Ausente"
                                    >
                                      <UserX size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
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

      {/* Credit Management Modal */}
      <AnimatePresence>
        {showCreditModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreditModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass rounded-[2.5rem] p-8 border-white/10 shadow-2xl text-center"
            >
              <div className="h-16 w-16 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 mx-auto mb-6">
                <Coins size={32} />
              </div>
              <h4 className="text-xl font-black text-white mb-2">Cargar Créditos</h4>
              <p className="text-sm text-brand-100/60 mb-8">Para: <span className="text-white font-bold">{showCreditModal.name}</span></p>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <button 
                  onClick={() => setCreditAmount(Math.max(1, creditAmount - 1))}
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-xl font-bold hover:bg-white/10"
                >-</button>
                <div className="text-3xl font-black text-white w-12">{creditAmount}</div>
                <button 
                  onClick={() => setCreditAmount(creditAmount + 1)}
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-xl font-bold hover:bg-white/10"
                >+</button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-8">
                {[4, 8, 12].map(num => (
                  <button
                    key={num}
                    onClick={() => setCreditAmount(num)}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${creditAmount === num ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'}`}
                  >
                    {num} Clases
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreditModal(null)}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all"
                >Cancelar</button>
                <button
                  onClick={handleAddCredits}
                  disabled={isUpdating === showCreditModal.studentId}
                  className="flex-1 py-4 rounded-2xl bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isUpdating === showCreditModal.studentId ? "Cargando..." : "Confirmar Carga"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Addition Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowManualModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass rounded-[2.5rem] p-8 border-white/10 shadow-2xl"
            >
              <h4 className="text-xl font-black text-white mb-6 text-center">Agregar Alumno Manualmente</h4>
              
              <div className="space-y-6">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setManualModality('presential')}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${manualModality === 'presential' ? 'bg-brand-500 text-white' : 'bg-white/5 text-white/40 border border-white/5'}`}
                  >📍 Presencial</button>
                  <button 
                    onClick={() => setManualModality('online')}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${manualModality === 'online' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/40 border border-white/5'}`}
                  >💻 Online</button>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Buscar Alumno Registrado</p>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Buscar @username..."
                      value={manualSearch}
                      onChange={(e) => setManualSearch(e.target.value)}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:border-brand-500 outline-none"
                    />
                    {manualResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark-alt border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                        {manualResults.map(user => (
                          <button
                            key={user.id}
                            onClick={() => handleManualAdd(user.id)}
                            className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                          >
                            <div className="h-8 w-8 rounded-full bg-brand-500/20 flex items-center justify-center font-bold text-brand-400">
                              {user.full_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{user.full_name}</p>
                              <p className="text-[10px] text-brand-400 font-black uppercase">@{user.username}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]"><span className="bg-surface-dark px-2 text-white/20">o</span></div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Invitado Externo</p>
                  <input 
                    type="text" 
                    placeholder="Nombre del alumno..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:border-brand-500 outline-none"
                  />
                  <button
                    onClick={() => handleManualAdd()}
                    disabled={isUpdating === "manual" || !guestName}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Agregar como Invitado
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
