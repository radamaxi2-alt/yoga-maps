import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
    .select("role, full_name, avatar_url, cover_position, username")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-black text-white uppercase italic mb-4">Error al cargar el perfil</h1>
        <p className="text-brand-100/60 mb-8">{profileError.message}</p>
        <Link href="/" className="rounded-full bg-brand-600 px-8 py-3 text-sm font-black text-white">Volver al Inicio</Link>
      </div>
    );
  }

  if (!profile) {
    console.warn("No profile found for user:", user.id);
    redirect("/");
  }

  // Determine form based on role
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

  // Professor or School form
  const { data: details } = await supabase
    .from("teacher_details")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ProfileEditForm
      fullName={profile.full_name || ""}
      avatarUrl={profile.avatar_url || ""}
      coverPosition={profile.cover_position ?? 50}
      username={profile.username || ""}
      details={details}
    />
  );
}
