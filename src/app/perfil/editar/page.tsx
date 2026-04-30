import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ProfileEditForm from "./ProfileEditForm";

export const metadata: Metadata = {
  title: "Editar Perfil",
  description: "Editá tu perfil de profesor en Yoga Maps.",
};

export default async function PerfilEditarPage() {
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

  if (!profile || profile.role !== "profesor") redirect("/");

  const { data: details } = await supabase
    .from("teacher_details")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ProfileEditForm
      fullName={profile.full_name || ""}
      details={details}
    />
  );
}
