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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, cover_position, username")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch error or no profile found:", profileError);
    // If no profile, we can't do much, but redirecting to home is what the user reports as "broken"
    // Let's try to see if we can at least show something or redirect to onboarding
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
