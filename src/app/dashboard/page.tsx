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
    .select("role, full_name")
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

  // Fetch teacher's classes
  const { data: classes } = await supabase
    .from("classes")
    .select("*, class_reservations(id, status, profiles(full_name, avatar_url, student_details(health_info)))")
    .eq("teacher_id", user.id)
    .order("scheduled_at", { ascending: true });

  const now = new Date();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-foreground/60">
            Hola, {profile.full_name || "Profesor"} 👋
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/perfil/editar"
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 px-5 py-3 text-sm font-semibold text-brand-700 transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-surface-dark-alt dark:bg-surface-dark-alt/60 dark:text-brand-300"
          >
            ✏️ Editar Perfil
          </Link>
          <Link
            href="/dashboard/nueva-clase"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:brightness-110"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Clase
          </Link>
        </div>
      </div>

      {/* Classes Table */}
      {classes && classes.length > 0 ? (
        <div className="mt-10 overflow-hidden rounded-2xl border border-brand-100/50 bg-white/70 shadow-lg shadow-brand-500/5 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark-alt/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100/30 dark:border-surface-dark-alt">
                  <th className="px-6 py-4 font-semibold text-foreground/60">
                    Clase
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground/60">
                    Fecha
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground/60">
                    Reservas
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground/60">
                    Estado
                  </th>
                  <th className="px-6 py-4 font-semibold text-foreground/60">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const date = new Date(cls.scheduled_at);
                  const isPast = date < now;
                  const confirmedReservations = cls.class_reservations?.filter((r: any) => r.status === "confirmed") || [];
                  const capacityText = cls.max_capacity ? `${confirmedReservations.length}/${cls.max_capacity}` : `${confirmedReservations.length}`;
                  
                  return (
                    <tr
                      key={cls.id}
                      className="border-b border-brand-100/20 transition-colors last:border-0 hover:bg-brand-50/30 dark:border-surface-dark-alt dark:hover:bg-surface-dark-alt/50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">
                          {cls.title}
                        </p>
                        {cls.jitsi_room_link && (
                          <span className="mt-0.5 inline-block text-xs text-blue-500">
                            🎥 Online
                          </span>
                        )}
                        {confirmedReservations.length > 0 && !isPast && (
                          <div className="mt-2 flex flex-col gap-1">
                            {confirmedReservations.map((res: any) => (
                              <div key={res.id} className="bg-brand-50 rounded-md p-2 text-xs flex items-center justify-between border border-brand-100 dark:bg-surface-dark dark:border-surface-dark-alt">
                                <span className="font-semibold text-brand-700 dark:text-brand-300">👤 {res.profiles?.full_name}</span>
                                {res.profiles?.student_details?.health_info && (
                                  <span className="text-red-500 cursor-help" title={res.profiles.student_details.health_info}>
                                    ❤️ Alerta Médica
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-foreground/70 align-top">
                        {date.toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        ·{" "}
                        {date.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground align-top">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls.is_full ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'}`}>
                          {capacityText} cupos
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isPast
                              ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          }`}
                        >
                          {isPast ? "Pasada" : "Próxima"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/editar-clase/${cls.id}`}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                          >
                            Editar
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
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl dark:bg-brand-900/30">
            📅
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No tenés clases creadas
          </h3>
          <p className="mt-2 text-sm text-foreground/60">
            Creá tu primera clase para que los alumnos puedan encontrarte.
          </p>
        </div>
      )}
    </section>
  );
}
