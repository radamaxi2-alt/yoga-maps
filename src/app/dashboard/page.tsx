import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteClassButton from "./DeleteClassButton";
import TeacherCalendar from "@/components/TeacherCalendar";

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

  // Fetch teacher's classes with reservations and their modality
  const { data: classes } = await supabase
    .from("classes")
    .select(`
      *,
      class_reservations(
        id, 
        status, 
        modality,
        profiles(full_name, avatar_url, student_details(health_info))
      )
    `)
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

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white tracking-tight italic">GESTIÓN DE CLASES</h2>
          <Link
            href="/dashboard/nueva-clase"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-xs font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:shadow-brand-500/40 hover:-translate-y-0.5"
          >
            + NUEVA CLASE
          </Link>
        </div>

        {/* Teacher Calendar Management */}
        <div className="mb-12">
          {classes && classes.length > 0 ? (
            <TeacherCalendar classes={classes as any} />
          ) : (
            <div className="mt-16 text-center glass rounded-[2.5rem] p-16 border-dashed border-white/10">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/10 text-5xl shadow-inner">📅</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">No tenés clases creadas</h3>
              <p className="mt-3 text-brand-100/40 font-medium">Empezá a cargar tu cartelera hoy mismo para verla en tu calendario.</p>
              <Link
                href="/dashboard/nueva-clase"
                className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-xs font-black text-brand-700 uppercase tracking-widest shadow-xl transition-all hover:scale-105"
              >
                Cargar mi primer clase
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
