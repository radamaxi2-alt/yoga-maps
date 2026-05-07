import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import TeacherCalendar from "@/components/TeacherCalendar";
import QuickActions from "./QuickActions";

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
    .select("role, full_name, avatar_url, subscription_plan, trial_expires_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/");

  if (profile.role === "alumno") {
    redirect("/student-profile");
  }

  // Fetch teacher details for the landing page look
  const { data: teacher } = await supabase
    .from("teacher_details")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch teacher's classes with reservations
  const { data: classesRaw, error: classesError } = await supabase
    .from("classes")
    .select(`
      *,
      class_reservations(
        id, 
        status, 
        modality,
        student_id,
        profiles(full_name, avatar_url)
      )
    `)
    .eq("teacher_id", user.id)
    .order("scheduled_at", { ascending: true });

  if (classesError) {
    console.error("Error fetching classes:", classesError);
  }

  const classes = classesRaw || [];

  // Fetch low credit notifications (students with 1 credit left)
  let lowCredits: any[] = [];
  try {
    const { data: lowCreditsRaw, error: lowCreditsError } = await supabase
      .from("teacher_credits")
      .select("*")
      .eq("teacher_id", user.id)
      .eq("credits", 1);

    if (lowCreditsRaw && !lowCreditsError) {
      const studentIds = lowCreditsRaw.map(lc => lc.student_id);
      const { data: studentProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", studentIds);
      
      lowCredits = lowCreditsRaw.map(lc => ({
        ...lc,
        profiles: studentProfiles?.find(p => p.id === lc.student_id) || null
      }));
    }
  } catch (e) {
    console.error("Critical error fetching low credits:", e);
  }

  const now = new Date();
  const name = profile?.full_name || "Profesor";
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
                {isSchool ? "Administrando Centro" : "Panel de Profesor"}
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
        {/* Free Trial Banner */}
        {new Date(profile.trial_expires_at) > now && (
          <div className="mb-10 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-cyan-600 to-brand-600 p-8 shadow-2xl shadow-cyan-500/10">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl shadow-inner backdrop-blur-md">🎁</div>
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">PRUEBA GRATUITA ACTIVA</h3>
                  <p className="text-sm font-medium text-white/80">
                    Estás usando la Prueba Gratis de 15 días. Te quedan <b className="text-white">{Math.ceil((new Date(profile.trial_expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}</b> días.
                  </p>
                </div>
              </div>
              <Link 
                href="/dashboard/planes"
                className="rounded-full bg-white px-8 py-3.5 text-xs font-black uppercase tracking-widest text-brand-700 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Ver Planes
              </Link>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        )}

        {/* Subscription Plan Status */}
        <div className="mb-12 glass rounded-[2.5rem] p-8 border-brand-500/20 bg-gradient-to-br from-brand-600/5 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full ring-1 ring-brand-500/30">Mi Suscripción</span>
              </div>
              <h2 className="text-3xl font-black text-white capitalize">Plan {profile.subscription_plan}</h2>
              <p className="text-sm text-brand-100/50 mt-1">
                Límite de <b>{profile.subscription_plan === 'zen' ? '12' : profile.subscription_plan === 'namaste' ? '80' : 'Ilimitado'}</b> clases por mes de suscripción.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-white/40 uppercase">Cupo Mensual</p>
                <p className="text-lg font-black text-white">
                  {profile.subscription_plan === 'zen' ? '12' : profile.subscription_plan === 'namaste' ? '80' : '∞'}
                </p>
              </div>
              <Link 
                href="/dashboard/planes"
                className="rounded-full bg-white px-8 py-4 text-xs font-black text-brand-700 shadow-xl transition-all hover:bg-brand-50 hover:-translate-y-1 active:scale-95"
              >
                GESTIONAR PLAN
              </Link>
            </div>
          </div>

          {/* Transfer Info */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4 border-t border-white/5 pt-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-black text-brand-400 uppercase mb-1">Plan Zen</p>
              <p className="text-lg font-black text-white">$15,000 <span className="text-[10px] opacity-40">/mes</span></p>
            </div>
            <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20 ring-1 ring-brand-500/30">
              <p className="text-[9px] font-black text-cyan-400 uppercase mb-1">Plan Namasté</p>
              <p className="text-lg font-black text-white">$50,000 <span className="text-[10px] opacity-40">/mes</span></p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[9px] font-black text-brand-400 uppercase mb-1">Plan Escuela</p>
              <p className="text-lg font-black text-white">$100,000 <span className="text-[10px] opacity-40">/mes</span></p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col items-center justify-center p-6 rounded-[2rem] bg-brand-500/5 border border-brand-500/10">
            <p className="text-sm font-bold text-white mb-2">Alias para transferencias:</p>
            <p className="text-2xl font-black text-brand-400 tracking-tight select-all">minado.runfla.lemon</p>
            
            <a 
              href={`https://wa.me/542231234567?text=${encodeURIComponent(`Hola! Ya transferí para mi Plan ${profile.subscription_plan}. Mi usuario es: ${profile.full_name} (${user.email})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3 text-xs font-black text-white shadow-xl hover:scale-105 transition-all"
            >
              <span>💬</span> ENVIAR COMPROBANTE POR WHATSAPP
            </a>
          </div>
        </div>

        {/* Low Credit Notifications */}
        {lowCredits && lowCredits.length > 0 && (
          <div className="mb-12 glass rounded-[2.5rem] p-8 border-amber-500/20 bg-amber-500/5">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              Alumnos con Créditos Bajos
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {lowCredits.map((lc: any) => (
                <div key={lc.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      {lc.profiles?.full_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{lc.profiles?.full_name || "Alumno desconocido"}</p>
                      <p className="text-[10px] text-amber-400 font-black uppercase">Último crédito disponible</p>
                    </div>
                  </div>
                  <a 
                    href={`https://wa.me/${teacher?.whatsapp_number || '542231234567'}?text=${encodeURIComponent(`¡Hola ${lc.profiles?.full_name}! Te queda solo 1 clase en tu abono con ${name}. ¿Querés renovar ahora para no perder tu lugar?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-amber-500/10 text-amber-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-500 hover:text-brand-900"
                    title="Avisar por WhatsApp"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.402.831 2.923 1.272 4.476 1.274h.001c5.42 0 9.832-4.412 9.835-9.834.001-2.628-1.022-5.1-2.881-6.959s-4.331-2.885-6.959-2.885c-5.422 0-9.833 4.412-9.836 9.834-.001 1.637.404 3.235 1.174 4.652l-.768 2.805 2.958-.787zm11.487-7.071c-.303-.153-1.8-.886-2.077-.988-.278-.101-.481-.153-.684.153-.202.303-.784.988-.962 1.19-.177.202-.354.228-.658.076-.304-.153-1.282-.473-2.441-1.507-.903-.805-1.512-1.8-1.689-2.102-.177-.304-.019-.468.133-.619.136-.136.304-.354.456-.531.151-.177.202-.304.304-.506.101-.202.051-.38-.025-.531-.076-.153-.684-1.646-.937-2.253-.247-.604-.499-.523-.684-.533l-.583-.007c-.202 0-.531.076-.81.38-.278.304-1.063 1.038-1.063 2.532 0 1.494 1.088 2.937 1.24 3.14.151.202 2.141 3.27 5.188 4.585.725.313 1.291.5 1.731.641.728.232 1.391.199 1.915.121.584-.087 1.8-.735 2.053-1.444.253-.708.253-1.316.177-1.444-.076-.127-.278-.202-.582-.355z"/></svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <QuickActions userId={user.id} isSchool={isSchool} />

        {/* Teacher Calendar Management */}
        <div className="mb-12">
          {classes && classes.length > 0 ? (
            <TeacherCalendar classes={classes as any} isSchool={isSchool} />
          ) : (
            <div className="mt-16 text-center glass rounded-[2.5rem] p-16 border-dashed border-white/10">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/10 text-5xl shadow-inner">📅</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">No tenés clases creadas</h3>
              <p className="mt-3 text-brand-100/40 font-medium">Empezá a cargar tu cartelera hoy mismo para verla en tu calendario.</p>
              {!isSchool && (
                <Link
                  href="/dashboard/nueva-clase"
                  className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-xs font-black text-brand-700 uppercase tracking-widest shadow-xl transition-all hover:scale-105"
                >
                  Cargar mi primer clase
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
