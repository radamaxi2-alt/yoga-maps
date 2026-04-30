import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import TeacherOnboardingForm from "./TeacherOnboardingForm";

export const metadata: Metadata = {
  title: "Completar Perfil de Profesor",
  description: "Completá tu perfil como profesor de yoga en Yoga Maps.",
};

export default async function OnboardingProfesorPage() {
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

  // Already completed?
  const { data: details } = await supabase
    .from("teacher_details")
    .select("id")
    .eq("id", user.id)
    .single();

  if (details) redirect("/");

  return <TeacherOnboardingForm userName={profile.full_name || "Profesor"} />;
}
