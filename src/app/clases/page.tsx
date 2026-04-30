import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import CalendarButton from "@/components/CalendarButton";
import LiveClassButton from "@/components/LiveClassButton";

export const metadata: Metadata = {
  title: "Clases",
  description:
    "Consulta la agenda de clases de yoga. Filtra por estilo, horario y ubicación.",
};

export default async function ClasesPage() {
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("*, teacher_details(profiles(full_name, avatar_url))")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

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
        <div className="mt-12 space-y-4">
          {classes.map((cls) => {
            const date = new Date(cls.scheduled_at);
            const teacherProfiles = (
              cls.teacher_details as {
                profiles: { full_name: string | null; avatar_url: string | null } | null;
              } | null
            )?.profiles;
            const teacherName = teacherProfiles?.full_name || "Profesor";

            return (
              <article
                key={cls.id}
                className="glass group flex flex-col gap-4 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 sm:flex-row sm:items-center sm:gap-6"
              >
                {/* Date badge */}
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/10">
                  <span className="text-xs font-medium uppercase text-brand-600 dark:text-brand-400">
                    {date.toLocaleDateString("es-AR", { month: "short" })}
                  </span>
                  <span className="text-xl font-bold text-brand-700 dark:text-brand-300">
                    {date.getDate()}
                  </span>
                </div>

                {/* Class info */}
                <div className="flex-1 font-sans">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400">
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
                    <Link
                      href={`/profesores/${cls.teacher_id}`}
                      className="flex items-center gap-1 transition-colors hover:text-brand-600"
                    >
                      <div className="h-5 w-5 overflow-hidden rounded-full bg-brand-100">
                        {teacherProfiles?.avatar_url ? (
                          <img src={teacherProfiles.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-brand-700">Y</span>
                        )}
                      </div>
                      {teacherName}
                    </Link>
                    <CalendarButton 
                      title={cls.title} 
                      scheduledAt={cls.scheduled_at} 
                      description={cls.description || ""} 
                      location={cls.jitsi_room_link || ""} 
                    />
                  </div>
                  {cls.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                      {cls.description}
                    </p>
                  )}
                </div>

                {/* Actions & Price */}
                <div className="flex flex-col items-start gap-3 sm:items-end sm:justify-center">
                  <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                    {Number(cls.price) === 0
                      ? "Gratis"
                      : `$${Number(cls.price).toLocaleString("es-AR")}`}
                  </span>
                  {cls.jitsi_room_link && (
                    <LiveClassButton jitsiLink={cls.jitsi_room_link} />
                  )}
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
