import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import CalendarButton from "@/components/CalendarButton";
import LiveClassButton from "@/components/LiveClassButton";
import ReserveButton from "@/components/ReserveButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("teacher_details")
    .select("profiles(full_name)")
    .eq("id", id)
    .single();

  const profile = data?.profiles as { full_name: string | null } | null;
  const name = profile?.full_name || "Profesor";

  return {
    title: name,
    description: `Perfil de ${name} — Profesor de yoga en Yoga Maps.`,
  };
}

export default async function TeacherProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: teacher } = await supabase
    .from("teacher_details")
    .select("*, profiles(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (!teacher) notFound();

  // Fetch teacher's upcoming classes
  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(10);

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

  const profile = teacher.profiles as {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  const name = profile?.full_name || "Profesor";

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/profesores"
        className="inline-flex items-center gap-1 text-sm text-foreground/50 transition-colors hover:text-brand-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al directorio
      </Link>

      {/* Profile Card */}
      <div className="mt-6 rounded-2xl border border-brand-100/50 bg-white/70 p-8 shadow-xl shadow-brand-500/5 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark-alt/70">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-4xl font-bold text-white shadow-lg shadow-brand-500/20">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              name[0].toUpperCase()
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {name}
            </h1>
            {teacher.address && (
              <p className="mt-1 text-sm text-foreground/50">
                📍 {teacher.address}
              </p>
            )}
            {teacher.specialties && teacher.specialties.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {teacher.specialties.map((spec: string) => (
                  <span
                    key={spec}
                    className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {teacher.bio && (
          <div className="mt-8 border-t border-brand-100/30 pt-6 dark:border-surface-dark-alt">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/40">
              Sobre {teacher.teacher_type === "escuela" ? "el centro" : "mí"}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/70">
              {teacher.bio}
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Classes */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-foreground">Próximas Clases</h2>

        {classes && classes.length > 0 ? (
          <div className="mt-6 space-y-4">
            {classes.map((cls) => {
              const date = new Date(cls.scheduled_at);
              const isFull = cls.is_full;
              const hasReserved = userReservations.has(cls.id);
              
              return (
                <article
                  key={cls.id}
                  className={`glass flex flex-col gap-5 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 sm:flex-row sm:items-center relative overflow-hidden ${isFull ? 'opacity-90' : ''}`}
                >
                  {/* Date badge */}
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100">
                    <span className="text-xs font-medium uppercase text-brand-600">
                      {date.toLocaleDateString("es-AR", { month: "short" })}
                    </span>
                    <span className="text-xl font-bold text-brand-700">
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 font-sans">
                    <h3 className="text-xl font-bold text-foreground">
                      {cls.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        🕐{" "}
                        {date.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        hs
                      </span>
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
                      <CalendarButton 
                        title={cls.title} 
                        scheduledAt={cls.scheduled_at} 
                        description={cls.description || ""} 
                        location={cls.jitsi_room_link || ""} 
                      />
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
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end sm:justify-center">
                    <span className="text-2xl font-bold text-brand-600">
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
          <p className="mt-6 text-sm text-foreground/50">
            Este profesor aún no tiene clases programadas.
          </p>
        )}
      </div>
    </section>
  );
}
