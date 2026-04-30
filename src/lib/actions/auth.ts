"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if profesor needs onboarding
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "profesor") {
      const { data: teacherDetails } = await supabase
        .from("teacher_details")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!teacherDetails) {
        redirect("/onboarding/profesor");
      }
    }
  }

  redirect("/");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") || "http://localhost:3000";

  const role = formData.get("role") as string;
  const fullName = formData.get("full_name") as string;

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Email confirmation required
  if (data.user && !data.session) {
    return {
      success: true,
      message:
        "¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.",
    };
  }

  // No email confirmation — redirect directly
  if (role === "profesor") {
    redirect("/onboarding/profesor");
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function completeTeacherProfile(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No estás autenticado." };
  }

  const specialtiesRaw = formData.getAll("specialties") as string[];

  const { error } = await supabase.from("teacher_details").insert({
    id: user.id,
    bio: (formData.get("bio") as string) || null,
    specialties: specialtiesRaw.length > 0 ? specialtiesRaw : null,
    address: (formData.get("address") as string) || null,
    latitude: formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null,
    longitude: formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
