"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUsername(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

  // Limpiar el username (quitar @, espacios, etc)
  const cleanUsername = username.replace(/[@\s]/g, "").toLowerCase();

  // Validar formato (letras, números, guiones y puntos)
  if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
    return { error: "El nombre de usuario solo puede contener letras, números, puntos y guiones." };
  }

  // Verificar si ya existe
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .maybeSingle();

  if (existing && existing.id !== user.id) {
    return { error: "Este nombre de usuario ya está en uso." };
  }

  // Actualizar
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
