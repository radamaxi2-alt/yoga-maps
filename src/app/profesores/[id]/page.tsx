import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import CalendarButton from "@/components/CalendarButton";
import LiveClassButton from "@/components/LiveClassButton";
import ReserveButton from "@/components/ReserveButton";
import MonthlyReserveButton from "@/components/MonthlyReserveButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .single();

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

  // Fetch from profiles first
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*, teacher_details(*)")
    .eq("id", id)
    .single();

  if (!profileRaw || profileRaw.role !== "profesor") notFound();

  const details = Array.isArray(profileRaw.teacher_details) 
    ? profileRaw.teacher_details[0] 
    : profileRaw.teacher_details;

  const isSchool = details?.teacher_type === "escuela";

  // Fetch teacher's (or school's linked) upcoming classes
  let classesQuery = supabase
    .from("classes")
    .select("*, profiles!classes_teacher_id_fkey(full_name, username, avatar_url)")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(20);

  if (isSchool) {
    classesQuery = classesQuery.eq("school_id", id);
  } else {
    classesQuery = classesQuery.eq("teacher_id", id);
  }

  const { data: classes } = await classesQuery;

  // If school, fetch staff (unique teachers who give classes here)
  let staff: any[] = [];
  if (isSchool && classes) {
    const staffIds = Array.from(new Set(classes.map(c => c.teacher_id)));
    const { data: staffProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, username")
      .in("id", staffIds);
    staff = staffProfiles || [];
  }

  // Fetch teacher's latest blog posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  let userReservations: Set<string> = new Set();
  let reservationCounts: Record<string, { presential: number; online: number }> = {};
  let isStudent = false;

  if (user) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    isStudent = userProfile?.role === "alumno";
  }

  if (classes && classes.length > 0) {
    const classIds = classes.map(c => c.id);
    
    const { data: allRes } = await supabase
      .from("class_reservations")
      .select("class_id, modality")
      .eq("status", "confirmed")
      .in("class_id", classIds);
      
    if (allRes) {
      allRes.forEach(r => {
        if (!reservationCounts[r.class_id]) reservationCounts[r.class_id] = { presential: 0, online: 0 };
        if (r.modality === 'presential') reservationCounts[r.class_id].presential++;
        if (r.modality === 'online') reservationCounts[r.class_id].online++;
      });
    }

    if (user) {
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
  }

  const name = profileRaw.full_name || "Profesor";

  return (
    <section className="bg-brand-50/30 min-h-screen pb-16 dark:bg-surface-dark">
      {/* Cover Image */}
      <div className="relative h-64 w-full sm:h-80 lg:h-96">
        {details?.cover_image ? (
          <img
            src={details.cover_image}
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
        {/* Profile Card Header */}
        <div className="-mt-24 relative z-10 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6 rounded-[2.5rem] bg-white/80 p-8 shadow-2xl shadow-brand-900/5 backdrop-blur-xl dark:bg-surface-dark-alt/90 border border-white/20">
          
          <div className="relative -mt-16 sm:-mt-24 flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-5xl font-bold text-white shadow-2xl shadow-brand-500/30 ring-8 ring-white/50 dark:ring-surface-dark-alt/50">
            {profileRaw.avatar_url ? (
              <img
                src={profileRaw.avatar_url}
                alt={name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              name[0].toUpperCase()
            )}
            <div className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm text-white shadow-md ring-4 ring-white dark:ring-surface-dark-alt">
              {isSchool ? "🏛️" : "🧘"}
            </div>
          </div>

          <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left pb-2">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl drop-shadow-sm">
              {name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-black text-brand-400 uppercase tracking-widest">
              {details?.address && (
                <span className="flex items-center gap-1">📍 {details.address}</span>
              )}
              <span className="flex items-center gap-1 bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full ring-1 ring-brand-500/30">
                {isSchool ? "Centro / Escuela" : "Instructor"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left Column: Bio & Staff & Gallery */}
          <div className="lg:col-span-1 space-y-12">
            <div className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-400 mb-6 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                Sobre {isSchool ? "Nosotros" : "Mí"}
              </h2>
              {details?.bio ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">
                  {details.bio}
                </p>
              ) : (
                <p className="text-sm text-white/30 italic">No hay información disponible.</p>
              )}

              {!isSchool && details?.specialties && details.specialties.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {details.specialties.map((spec: string) => (
                      <span key={spec} className="rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-[10px] font-black text-brand-300 uppercase tracking-wider">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isSchool && staff.length > 0 && (
              <div className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl">
                <h2 className="text-xs font-black uppercase tracking-widest text-brand-400 mb-6 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  Nuestro Staff
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  {staff.map(member => (
                    <Link key={member.id} href={`/profesores/${member.id}`} title={member.full_name}>
                      <img 
                        src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.full_name}`} 
                        className="h-12 w-12 rounded-2xl object-cover hover:scale-110 transition-transform ring-2 ring-white/10 hover:ring-brand-500/50 shadow-lg"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {details?.gallery && details.gallery.length > 0 && (
              <div className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl">
                <h2 className="text-xs font-black uppercase tracking-widest text-brand-400 mb-6 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  Galería
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {details.gallery.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden group">
                      <img src={img} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Classes & Blog */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                Cartelera de Clases
                <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </h2>

              {classes && classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((cls) => {
                    const date = new Date(cls.scheduled_at);
                    const isFull = cls.is_full;
                    const hasReserved = userReservations.has(cls.id);
                    const counts = reservationCounts[cls.id] || { presential: 0, online: 0 };
                    const teacher = (cls as any).profiles;
                    
                    return (
                      <article
                        key={cls.id}
                        className="group relative overflow-hidden rounded-[2rem] glass p-6 border border-white/5 transition-all hover:scale-[1.01] hover:bg-white/5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                          {/* Date badge */}
                          <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/20">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">
                              {date.toLocaleDateString("es-AR", { month: "short" })}
                            </span>
                            <span className="text-3xl font-black text-white">
                              {date.getDate()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-white group-hover:text-brand-400 transition-colors">
                              {cls.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-white/40">
                              <span className="flex items-center gap-1.5">
                                <span className="text-brand-400">🕐</span> {date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {cls.style && (
                                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-brand-300 ring-1 ring-white/10 uppercase tracking-wider text-[10px]">
                                  {cls.style}
                                </span>
                              )}
                              {isSchool && teacher && (
                                <Link href={`/profesores/${cls.teacher_id}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                  <span className="text-brand-400">👨‍🏫</span> {teacher.full_name}
                                </Link>
                              )}
                            </div>
                            <div className="mt-4 flex gap-4">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">SALA: {counts.presential}/{cls.capacity_presential}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">ONLINE: {counts.online}/{cls.capacity_online}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start sm:items-end gap-4 shrink-0">
                            <span className="text-2xl font-black text-brand-400">
                              {Number(cls.price) === 0 ? "Gratis" : `$${Number(cls.price).toLocaleString("es-AR")}`}
                            </span>
                            <div className="flex items-center gap-3">
                              {isStudent && (
                                <div className="flex flex-col items-end gap-2">
                                  <ReserveButton 
                                    classId={cls.id} 
                                    classTitle={cls.title}
                                    scheduledAt={cls.scheduled_at}
                                    isFull={isFull} 
                                    userHasReserved={hasReserved}
                                    currentPresential={counts.presential}
                                    currentOnline={counts.online}
                                    maxPresential={cls.capacity_presential || 0}
                                    maxOnline={cls.capacity_online || 0}
                                    teacherWhatsapp={details?.whatsapp_number || "542231234567"}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/5 p-12 text-center">
                  <span className="text-5xl block mb-4">🧘</span>
                  <p className="text-sm font-bold text-white/30 uppercase tracking-widest">Aún no hay clases programadas</p>
                </div>
              )}
            </div>

            {posts && posts.length > 0 && (
              <div className="pt-8">
                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                  Últimos Posts
                  <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </h2>
                <div className="grid gap-8 sm:grid-cols-2">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="group flex flex-col overflow-hidden rounded-[2rem] glass border border-white/5 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10"
                    >
                      <div className="aspect-[16/9] w-full bg-brand-900/20 overflow-hidden relative">
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-surface-dark" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-black text-white text-lg line-clamp-2 group-hover:text-brand-400 transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/30">
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
