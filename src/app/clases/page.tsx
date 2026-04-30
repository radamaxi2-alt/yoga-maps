import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import CalendarButton from "@/components/CalendarButton";
import LiveClassButton from "@/components/LiveClassButton";
import ReserveButton from "@/components/ReserveButton";

export const metadata: Metadata = {
  title: "Clases",
  description:
    "Consulta la agenda de clases de yoga. Filtra por estilo, horario y ubicación.",
};

export default async function ClasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: classes } = await supabase
    .from("classes")
    .select("*, teacher_details(profiles(full_name, avatar_url))")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  let userReservations: Set<string> = new Set();
  if (user && classes && classes.length > 0) {
    const classIds = classes.map(c => c.id);
    const { data: reservations } = await supabase
      .from("class_reservations")
      .select("class_id")
      .eq("student_id", user.id)
      .eq("status", "confirmed")
      .in("class_id", classIds);
      
    if (reservations) {
      userReservations = new Set(reservations.map(r => r.class_id));
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="mb-2 inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
          Agenda
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Próximas Clases
        </h1>
        <p className="mt-4 text-lg text-foreground/60">
          Explorá las próximas clases de yoga y reservá tu lugar.
        </p>
      </div>

      {/* Classes List */}
      {classes && classes.length > 0 ? (
        <div className="mt-12 space-y-6">
          {classes.map((cls) => {
            const profile = cls.teacher_details?.profiles as unknown as {
              full_name: string | null;
              avatar_url: string | null;
            } | null;
            const name = profile?.full_name || "Profesor";
            const date = new Date(cls.scheduled_at);
            const isFull = cls.is_full;
            const hasReserved = userReservations.has(cls.id);

            return (
              <article
                key={cls.id}
                className={`glass flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 ${isFull ? 'opacity-90' : ''}`}
              >
                {/* Date badge */}
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 shadow-inner">
                  <span className="text-sm font-semibold uppercase text-brand-600">
                    {date.toLocaleDateString("es-AR", { month: "short" })}
                  </span>
                  <span className="text-2xl font-bold text-brand-700">
                    {date.getDate()}
                  </span>
                </div>

                <div className="flex-1 font-sans">
                  <h2 className="text-2xl font-bold text-foreground">
                    {cls.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-foreground/70">
                    <span className="flex items-center gap-1.5 font-medium">
                      🕐{" "}
                      {date.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      hs
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
                      <span className="font-medium text-brand-900 dark:text-brand-100">
                        {name}
                      </span>
                    </Link>
                    {cls.style && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                        {cls.style}
                      </span>
                    )}
                    {cls.instructor_name && (
                      <span className="text-xs text-foreground/50">
                        👨‍🏫 {cls.instructor_name}
                      </span>
                    )}
                    {hasReserved && (
                      <CalendarButton 
                        title={cls.title} 
                        scheduledAt={cls.scheduled_at} 
                        description={cls.description || ""} 
                        location={cls.jitsi_room_link || cls.address || ""} 
                      />
                    )}
                  </div>

                  {cls.is_full && !hasReserved && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-100 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        {cls.jitsi_room_link 
                          ? "Cupos presenciales agotados - Únete a la clase Online" 
                          : "Sala Llena - No hay cupos disponibles"}
                      </span>
                    </div>
                  )}

                  {cls.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-foreground/60">
                      {cls.description}
                    </p>
                  )}
                </div>

                {/* Actions & Price */}
                <div className="flex flex-col items-start gap-4 sm:items-end sm:justify-center">
                  <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                    {Number(cls.price) === 0
                      ? "Gratis"
                      : `$${Number(cls.price).toLocaleString("es-AR")}`}
                  </span>
                  
                  <div className="flex flex-col gap-2 w-full sm:w-auto items-end">
                    <ReserveButton classId={cls.id} isFull={isFull} userHasReserved={hasReserved} />
                    
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
        <div className="mt-16 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl dark:bg-brand-900/30">
            📅
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No hay clases programadas
          </h3>
          <p className="mt-2 text-sm text-foreground/60">
            Las clases aparecerán acá cuando los profesores las publiquen.
          </p>
        </div>
      )}
    </section>
  );
}
