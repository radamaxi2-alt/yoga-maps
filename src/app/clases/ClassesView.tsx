"use client";

import React, { useState, useMemo } from "react";
import { parseISO, format, getHours } from "date-fns";
import PageHero from "@/components/PageHero";
import ClassesFilter from "./ClassesFilter";
import ReserveButton from "@/components/ReserveButton";
import LiveClassButton from "@/components/LiveClassButton";
import Link from "next/link";

interface Props {
  initialClasses: any[];
  userReservations: Set<string>;
  reservationCounts: Record<string, { presential: number; online: number }>;
}

export default function ClassesView({ initialClasses, userReservations, reservationCounts }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");

  const filteredClasses = useMemo(() => {
    let filtered = initialClasses;

    if (selectedDate) {
      filtered = filtered.filter(cls => {
        const classDateStr = format(parseISO(cls.scheduled_at), "yyyy-MM-dd");
        return classDateStr === selectedDate;
      });
    }

    if (selectedTimeRange !== "all") {
      filtered = filtered.filter(cls => {
        const hour = getHours(parseISO(cls.scheduled_at));
        if (selectedTimeRange === "morning") return hour >= 6 && hour < 12;
        if (selectedTimeRange === "afternoon") return hour >= 12 && hour < 18;
        if (selectedTimeRange === "evening") return hour >= 18 && hour < 24;
        return true;
      });
    }

    return filtered;
  }, [initialClasses, selectedDate, selectedTimeRange]);

  return (
    <>
      <PageHero 
        title="Agenda de Clases"
        subtitle="Explorá las próximas prácticas y reservá tu lugar en sala o de forma online."
        backgroundImage="/images/hero-clases.png"
        badge="🧘 Práctica Hoy"
      />
      
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <ClassesFilter 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
          selectedTimeRange={selectedTimeRange}
          onTimeRangeSelect={setSelectedTimeRange}
        />

        {/* Classes List */}
        {filteredClasses.length > 0 ? (
          <div className="space-y-6">
            {filteredClasses.map((cls) => {
              const profile = cls.teacher_details?.profiles as any;
              const name = profile?.full_name || "Profesor";
              const username = profile?.username;
              const date = parseISO(cls.scheduled_at);
              const isFull = cls.is_full;
              const hasReserved = userReservations.has(cls.id);
              
              return (
                <article
                  key={cls.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] glass p-8 shadow-2xl transition-all hover:shadow-brand-500/10 sm:flex-row sm:items-center border border-white/5"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-400 ring-1 ring-brand-500/20">
                        🕐{" "}
                        {date.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Link
                        href={`/profesores/${cls.teacher_id}`}
                        className="flex items-center gap-2 rounded-full border border-brand-100/50 bg-white/50 py-1 pl-1 pr-3 transition-colors hover:bg-brand-50 dark:border-surface-dark-alt dark:bg-surface-dark-alt/50 dark:hover:bg-brand-900/20"
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                            {name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col leading-none">
                          <span className="font-bold text-brand-900 dark:text-brand-100 text-xs">
                            {name}
                          </span>
                          {username && (
                            <span className="text-[9px] font-medium text-brand-400">
                              @{username}
                            </span>
                          )}
                        </div>
                      </Link>
                      {cls.style && (
                        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-[10px] font-bold text-brand-400 uppercase tracking-widest ring-1 ring-brand-500/20">
                          {cls.style}
                        </span>
                      )}

                      <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                          📍 Sala: <b className="text-white">{reservationCounts[cls.id]?.presential || 0}/{cls.capacity_presential ?? 0}</b>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                          💻 Online: <b className="text-white">{reservationCounts[cls.id]?.online || 0}/{cls.capacity_online ?? 0}</b>
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white uppercase tracking-tight italic">
                      {cls.title} <span className="text-brand-500/40 text-lg not-italic lowercase font-medium ml-2">de @{username || "profesor"}</span>
                    </h3>

                    {cls.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                        {cls.description}
                      </p>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="mt-6 flex flex-col items-start gap-4 sm:mt-0 sm:items-end sm:justify-center">
                    <span className="text-3xl font-black text-brand-400 italic">
                      {Number(cls.price) === 0
                        ? "Gratis"
                        : `$${Number(cls.price).toLocaleString("es-AR")}`}
                    </span>
                    
                    <div className="flex flex-col gap-2 w-full sm:w-auto items-end">
                      <ReserveButton 
                        classId={cls.id} 
                        classTitle={cls.title}
                        scheduledAt={cls.scheduled_at}
                        isFull={isFull} 
                        userHasReserved={hasReserved}
                        currentPresential={reservationCounts[cls.id]?.presential || 0}
                        currentOnline={reservationCounts[cls.id]?.online || 0}
                        maxPresential={cls.capacity_presential || 15}
                        maxOnline={cls.capacity_online || 5}
                      />
                      
                      {cls.jitsi_room_link && (
                        <LiveClassButton jitsiLink={cls.jitsi_room_link} />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-[2.5rem] border border-dashed border-white/10">
            <div className="text-5xl mb-4">🧘‍♀️</div>
            <h3 className="text-xl font-black text-white uppercase italic">No se encontraron clases</h3>
            <p className="text-white/40 mt-2">Probá seleccionando otro día o rango horario.</p>
          </div>
        )}
      </section>
    </>
  );
}
