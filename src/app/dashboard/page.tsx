import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteClassButton from "./DeleteClassButton";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Gestioná tus clases y tu perfil de profesor.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/");

  if (profile.role === "alumno") {
    // Student Dashboard view
    const { data: reservations } = await supabase
      .from("class_reservations")
      .select("*, classes(*, teacher_details(profiles(full_name, avatar_url)))")
      .eq("student_id", user.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    return (
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Mi Espacio
            </h1>
            <p className="mt-1 text-foreground/60">
              Hola, {profile.full_name || "Alumno"} 👋
            </p>
          </div>
          <Link
            href="/perfil/editar"
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-5 py-3 text-sm font-semibold text-brand-700 transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-surface-dark-alt dark:bg-surface-dark-alt/60 dark:text-brand-300"
          >
            ✏️ Editar Perfil & Salud
          </Link>
        </div>

        <h2 className="text-xl font-bold mb-4">Mis Reservas</h2>
        {reservations && reservations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {reservations.map(res => {
              const cls = res.classes as any;
              if (!cls) return null;
              const date = new Date(cls.scheduled_at);
              const teacherName = cls.teacher_details?.profiles?.full_name || "Profesor";
              
              return (
                <div key={res.id} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm dark:border-surface-dark-alt dark:bg-surface-dark-alt">
                  <h3 className="font-bold text-lg">{cls.title}</h3>
                  <p className="text-sm text-foreground/70 mb-3">Con {teacherName}</p>
                  <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
                    <span>🕐 {date.toLocaleDateString("es-AR")} {date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}hs</span>
                  </div>
                  {cls.jitsi_room_link && (
                    <a href={cls.jitsi_room_link} target="_blank" className="text-sm font-medium text-blue-600 hover:underline">
                      Ir a sala online
                    </a>
                  )}
                  {cls.address && (
                    <p className="text-sm text-foreground/60">📍 {cls.address}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-foreground/50 text-sm">Aún no tienes clases reservadas.</p>
        )}
      </section>
    );
  }

  // Fetch teacher details for the landing page look
  const { data: teacher } = await supabase
    .from("teacher_details")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch teacher's classes
  const { data: classes } = await supabase
    .from("classes")
    .select("*, class_reservations(id, status, profiles(full_name, avatar_url, student_details(health_info)))")
    .eq("teacher_id", user.id)
    .order("scheduled_at", { ascending: true });

  const now = new Date();
  const name = profile.full_name || "Profesor";
  const isSchool = teacher?.teacher_type === "escuela";

  return (
    <div className="min-h-screen bg-brand-50/30 dark:bg-surface-dark pb-16">
      {/* Landing Page Header Component */}
      <div className="relative h-48 w-full sm:h-64 lg:h-72">
        {teacher?.cover_image ? (
          <img
            src={teacher.cover_image}
            alt="Portada"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-tr from-brand-800 via-brand-600 to-brand-400"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full bg-white p-1 shadow-xl ring-2 ring-white/50">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-500 text-3xl font-bold text-white uppercase">
                  {name[0]}
                </div>
              )}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
              <p className="text-sm font-medium opacity-90">
                {isSchool ? "Administrando Centro" : "Panel de Instructor"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/profesores/${user.id}`}
              className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/30"
            >
              👁️ Ver Perfil Público
            </Link>
            <Link
              href="/perfil/editar"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              ✏️ Editar Perfil
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Gestión de Clases</h2>
          <Link
            href="/dashboard/nueva-clase"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:brightness-110"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Clase
          </Link>
        </div>

        {/* Classes Table */}
        {classes && classes.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-brand-100/50 bg-white shadow-xl shadow-brand-500/5 dark:border-surface-dark-alt dark:bg-surface-dark-alt">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand-50/50 border-b border-brand-100/30 dark:bg-surface-dark-alt/50 dark:border-surface-dark-alt">
                    <th className="px-6 py-4 font-bold text-foreground/60 uppercase tracking-wider text-[10px]">Clase</th>
                    <th className="px-6 py-4 font-bold text-foreground/60 uppercase tracking-wider text-[10px]">Fecha / Hora</th>
                    <th className="px-6 py-4 font-bold text-foreground/60 uppercase tracking-wider text-[10px]">Reservas</th>
                    <th className="px-6 py-4 font-bold text-foreground/60 uppercase tracking-wider text-[10px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/20 dark:divide-surface-dark-alt">
                  {classes.map((cls) => {
                    const date = new Date(cls.scheduled_at);
                    const isPast = date < now;
                    const confirmedReservations = cls.class_reservations?.filter((r: any) => r.status === "confirmed") || [];
                    const capacityText = cls.max_capacity ? `${confirmedReservations.length}/${cls.max_capacity}` : `${confirmedReservations.length}`;
                    
                    return (
                      <tr key={cls.id} className="transition-colors hover:bg-brand-50/20 dark:hover:bg-surface-dark-alt/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-foreground">{cls.title}</p>
                          {cls.jitsi_room_link && (
                            <span className="inline-block text-[10px] font-bold text-blue-500 uppercase tracking-tight">🎥 Online</span>
                          )}
                          {confirmedReservations.length > 0 && !isPast && (
                            <div className="mt-3 space-y-1.5">
                              {confirmedReservations.map((res: any) => (
                                <div key={res.id} className="flex items-center justify-between rounded-lg bg-brand-50/50 p-2 text-[11px] border border-brand-100 dark:bg-surface-dark dark:border-surface-dark-alt">
                                  <span className="font-medium">👤 {res.profiles?.full_name}</span>
                                  {res.profiles?.student_details?.health_info && (
                                    <span className="rounded bg-red-100 px-1 text-[9px] font-bold text-red-600 dark:bg-red-900/40">ALERTA</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-foreground/70">
                          <div className="font-medium text-foreground">
                            {date.toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
                          </div>
                          <div className="text-xs opacity-60">
                            {date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}hs
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cls.is_full ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {capacityText} anotados
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/editar-clase/${cls.id}`}
                              className="rounded-lg bg-brand-50 p-2 text-brand-600 transition-colors hover:bg-brand-100 dark:bg-surface-dark dark:text-brand-400"
                            >
                              ✏️
                            </Link>
                            <DeleteClassButton classId={cls.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-4xl shadow-inner dark:bg-surface-dark-alt">📅</div>
            <h3 className="text-lg font-bold text-foreground">No tenés clases creadas</h3>
            <p className="mt-2 text-sm text-foreground/60">Empezá a cargar tu cartelera hoy mismo.</p>
          </div>
        )}
      </section>
    </div>
  );
}
