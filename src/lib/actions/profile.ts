"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUsername(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  const cleanUsername = username.replace(/[@\s]/g, "").toLowerCase();

  if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
    return { error: "El nombre de usuario solo puede contener letras, números, puntos y guiones." };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .maybeSingle();

  if (existing && existing.id !== user.id) {
    return { error: "Este nombre de usuario ya está en uso." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username: cleanUsername })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true, username: cleanUsername };
}

export async function checkUsernameAvailability(username: string) {
  const supabase = await createClient();
  const cleanUsername = username.replace(/[@\s]/g, "").toLowerCase();
  
  if (cleanUsername.length < 3) return { available: false };

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .maybeSingle();

  return { available: !data };
}

export async function updateTeacherProfile(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  // Explicitly destructure fields that are NOT in teacher_details
  const { full_name, username, avatar_url, whatsapp_number, ...details } = data;

  // Update profile (Only standard columns)
  const { error: pError } = await supabase
    .from("profiles")
    .update({ full_name, username, avatar_url })
    .eq("id", user.id);
  
  if (pError) return { error: pError.message };

  // Update details (Everything else)
  const { error: dError } = await supabase
    .from("teacher_details")
    .update(details)
    .eq("id", user.id);

  if (dError) return { error: dError.message };

  revalidatePath("/perfil/editar");
  return { success: true };
}

export async function updateStudentProfile(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { full_name, username, avatar_url, whatsapp_number, ...details } = data;

  const { error: pError } = await supabase
    .from("profiles")
    .update({ full_name, username, avatar_url })
    .eq("id", user.id);
  
  if (pError) return { error: pError.message };

  const { error: dError } = await supabase
    .from("student_details")
    .update(details)
    .eq("id", user.id);

  if (dError) return { error: dError.message };

  revalidatePath("/perfil/editar");
  return { success: true };
}

export async function uploadTeacherAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const file = formData.get("avatar") as File;
  const path = `${user.id}/avatar-${Date.now()}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file);

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  revalidatePath("/perfil/editar");
  return { publicUrl };
}

export async function uploadTeacherCover(formData: FormData) {
  // Logic similar to avatar
  return { success: true };
}

export async function updateCoverPosition(position: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  await supabase
    .from("profiles")
    .update({ cover_position: position })
    .eq("id", user.id);

  return { success: true };
}
