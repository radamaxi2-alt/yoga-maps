import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProfileEditForm from "./ProfileEditForm";
import StudentProfileForm from "./StudentProfileForm";

export const metadata: Metadata = {
  title: "Editar Perfil",
  description: "Editá tu perfil en Yoga Maps.",
};

export default async function PerfilEditarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user found in session, redirecting to login");
    redirect("/login");
  }

  // Fetch profile with error handling
  console.log("Fetching profile for user:", user.id);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, username")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error cargando perfil:", profileError);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-white uppercase italic">Error de Conexión</h1>
        <p className="text-white/40 text-sm mt-2">{profileError.message}</p>
        <Link href="/" className="mt-6 rounded-full bg-brand-600 px-8 py-3 text-sm font-black text-white">Volver al Inicio</Link>
      </div>
    );
  }

  if (!profile) {
    console.warn("No profile found for user:", user.id, "Attempting auto-creation...");
    
    // Attempt auto-creation from session metadata
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario",
        role: user.user_metadata?.role || "alumno", // Default to student
      })
      .select()
      .single();

    if (createError || !newProfile) {
      console.error("Failed to auto-create profile:", createError);
      redirect("/");
    }
    
    // Continue with the newly created profile
    return (
      <StudentProfileForm
        fullName={newProfile.full_name || ""}
        username=""
        details={null}
      />
    );
  }

  // 3. Renderizado Condicional por Rol
  if (profile.role === "alumno") {
    const { data: details } = await supabase
      .from("student_details")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return (
      <StudentProfileForm
        fullName={profile.full_name || ""}
        username={profile.username || ""}
        details={details}
      />
    );
  }

  // Formulario para Profesores y Escuelas
  const { data: details } = await supabase
    .from("teacher_details")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ProfileEditForm
      fullName={profile.full_name || ""}
      avatarUrl={profile.avatar_url || ""}
      username={profile.username || ""}
      details={details}
    />
  );
}
