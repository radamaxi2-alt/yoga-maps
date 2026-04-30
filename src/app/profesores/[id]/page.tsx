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

  // Fetch teacher's latest blog posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", id)
    .order("created_at", { ascending: false })
    .limit(3);

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
  const isSchool = teacher.teacher_type === "escuela";

  return (
    <section className="bg-brand-50/30 min-h-screen pb-16 dark:bg-surface-dark">
      {/* Cover Image */}
      <div className="relative h-64 w-full sm:h-80 lg:h-96">
        {teacher.cover_image ? (
          <img
            src={teacher.cover_image}
            alt="Portada"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-tr from-brand-800 via-brand-600 to-brand-400"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
          <Link
            href="/profesores"
            className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Directorio
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Profile Card Header (Overlaps Cover) */}
        <div className="-mt-24 relative z-10 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6 rounded-3xl bg-white/80 p-6 shadow-xl shadow-brand-900/5 backdrop-blur-xl dark:bg-surface-dark-alt/90">
          
          <div className="relative -mt-16 sm:-mt-24 flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-5xl font-bold text-white shadow-2xl shadow-brand-500/30 ring-4 ring-white dark:ring-surface-dark-alt">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              name[0].toUpperCase()
            )}
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm text-white shadow-md ring-2 ring-white dark:ring-surface-dark-alt">
              {isSchool ? "🏛️" : "🧘"}
            </div>
          </div>

          <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left pb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-foreground/70">
              {teacher.address && (
                <span className="flex items-center gap-1">📍 {teacher.address}</span>
              )}
              <span className="flex items-center gap-1 bg-brand-100 text-brand-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold">
                {isSchool ? "Centro / Escuela" : "Instructor"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Bio & Specialties */}
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-100/50 dark:bg-surface-dark-alt dark:ring-surface-dark-alt">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">
                Sobre {isSchool ? "Nosotros" : "Mí"}
              </h2>
              {teacher.bio ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {teacher.bio}
                </p>
              ) : (
                <p className="mt-4 text-sm text-foreground/50 italic">No hay información disponible.</p>
              )}

              {teacher.specialties && teacher.specialties.length > 0 && (
                <div className="mt-6 border-t border-brand-50 pt-6 dark:border-surface-dark">
                  <h3 className="text-xs font-semibold uppercase text-foreground/50 mb-3">Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specialties.map((spec: string) => (
                      <span
                        key={spec}
                        className="rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Classes & Blog */}
          <div className="lg:col-span-2 space-y-10">
            {/* Upcoming Classes */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Cartelera de Clases</h2>
              </div>

              {classes && classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((cls) => {
                    const date = new Date(cls.scheduled_at);
                    const isFull = cls.is_full;
                    const hasReserved = userReservations.has(cls.id);
                    
                    return (
                      <article
                        key={cls.id}
                        className={`group flex flex-col sm:flex-row sm:items-center gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-brand-100/50 transition-all hover:shadow-lg hover:shadow-brand-500/5 dark:bg-surface-dark-alt dark:ring-surface-dark-alt ${isFull ? 'opacity-90' : ''}`}
                      >
                        {/* Date badge */}
                        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 group-hover:bg-brand-100 transition-colors dark:bg-brand-900/20">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
                            {date.toLocaleDateString("es-AR", { month: "short" })}
                          </span>
                          <span className="text-2xl font-bold text-brand-700 dark:text-brand-400">
                            {date.getDate()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-foreground truncate">
                            {cls.title}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-foreground/60">
                            <span className="flex items-center gap-1 font-medium">
                              🕐 {date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs
                            </span>
                            {cls.style && (
                              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-600">
                                {cls.style}
                              </span>
                            )}
                            {cls.instructor_name && (
                              <span className="text-xs font-medium">👨‍🏫 {cls.instructor_name}</span>
                            )}
                            {hasReserved && (
                              <CalendarButton 
                                title={cls.title} 
                                scheduledAt={cls.scheduled_at} 
                                description={cls.description || ""} 
                                location={cls.jitsi_room_link || ""} 
                              />
                            )}
                          </div>
                          {cls.is_full && !hasReserved && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 border border-red-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                {cls.jitsi_room_link ? "Presencial agotado - Sólo Online" : "Sala Llena"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                          <span className="text-xl font-black text-brand-600">
                            {Number(cls.price) === 0 ? "Gratis" : `$${Number(cls.price).toLocaleString("es-AR")}`}
                          </span>
                          <div className="flex items-center gap-2">
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
                <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 p-8 text-center dark:border-surface-dark-alt dark:bg-surface-dark-alt/30">
                  <span className="text-3xl">🧘</span>
                  <p className="mt-3 text-sm font-medium text-foreground/60">Aún no hay clases programadas.</p>
                </div>
              )}
            </div>

            {/* Blog Posts */}
            {posts && posts.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Últimos Posts</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brand-100/50 transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-surface-dark-alt dark:ring-surface-dark-alt"
                    >
                      <div className="aspect-[16/9] w-full bg-brand-100 overflow-hidden relative">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-300 to-brand-500" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-brand-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-xs text-foreground/50">
                          {new Date(post.created_at).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
