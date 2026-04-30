import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";

async function updateStudentProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const bio = formData.get("bio") as string;
  const health_info = formData.get("health_info") as string;
  const full_name = formData.get("full_name") as string;

  // Update profile name
  await supabase
    .from("profiles")
    .update({ full_name })
    .eq("id", user.id);

  // Upsert student details
  const { error } = await supabase
    .from("student_details")
    .upsert({
      id: user.id,
      bio,
      health_info,
    });

  if (error) console.error(error);
  revalidatePath("/student-profile");
}

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, student_details(*)")
    .eq("id", user.id)
    .single();

  if (!profile) return notFound();

  if (profile.role !== "alumno") {
    redirect("/dashboard");
  }

  // Get student's reservations
  const { data: reservations } = await supabase
    .from("class_reservations")
    .select(`
      *,
      classes (
        title,
        day_of_week,
        start_time,
        style,
        teacher_details (
          profiles (full_name)
        )
      )
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const student = profile.student_details as any;

  return (
    <div className="bg-surface-dark-alt min-h-screen mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass overflow-hidden rounded-3xl p-8 text-center">
            <div className="mx-auto relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg bg-brand-100">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || "Alumno"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  🧘
                </div>
              )}
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">
              {profile.full_name || "Tu Nombre"}
            </h1>
            <p className="text-sm text-foreground/60 font-sans">{user.email}</p>
            
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/profesores"
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-500"
              >
                Explorar Clases
              </Link>
            </div>
          </div>

          {/* Ficha Médica Card */}
          <div className="mt-8 glass rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-bold text-foreground">Ficha Médica</h2>
            </div>
            <form action={updateStudentProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
                  Nombre Completo
                </label>
                <input
                  name="full_name"
                  defaultValue={profile.full_name || ""}
                  className="w-full rounded-xl border border-brand-100 bg-white/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
                  Sobre mí
                </label>
                <textarea
                  name="bio"
                  defaultValue={student?.bio || ""}
                  rows={3}
                  className="w-full rounded-xl border border-brand-100 bg-white/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Ej: Practico hace 2 años, busco flexibilidad..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                  Información de Salud (Lesiones, Dolores)
                </label>
                <textarea
                  name="health_info"
                  defaultValue={student?.health_info || ""}
                  rows={4}
                  className="w-full rounded-xl border border-red-100 bg-red-50/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Dolor lumbar crónico, operación de rodilla derecha..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-600 shadow-sm border border-brand-100 transition-all hover:bg-brand-50"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Reservations & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Mis Próximas Clases</h2>
            
            {reservations && reservations.length > 0 ? (
              <div className="grid gap-6">
                {reservations.map((res: any) => {
                  const cls = res.classes;
                  if (!cls) return null;
                  return (
                    <div key={res.id} className="flex items-center justify-between rounded-[2rem] bg-surface-dark/40 p-6 border border-white/5 transition-all hover:border-brand-500/20">
                      <div>
                        <h4 className="text-lg font-bold text-white">{cls.title}</h4>
                        <p className="text-xs text-brand-400 font-bold uppercase tracking-wider mt-1">
                          {cls.style} — {cls.teacher_details?.profiles?.full_name || "Profesor"}
                        </p>
                        <p className="mt-2 text-sm text-brand-100/60">
                          {cls.day_of_week} a las {cls.start_time?.slice(0,5)} hs
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-[10px] font-bold text-brand-400 uppercase tracking-widest ring-1 ring-brand-500/20">
                          Confirmada
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-dark/20 rounded-[2rem] border border-dashed border-white/10">
                <span className="text-5xl block mb-6">🧘‍♀️</span>
                <p className="text-brand-100/60 font-medium">Parece que aún no tienes reservas activas.</p>
                <Link href="/clases" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-500 hover:-translate-y-0.5">
                  Explorar Agenda →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
