"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function reserveClass(classId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para reservar una clase." };
  }

  // Verificar si hay cupo disponible
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("max_capacity, is_full")
    .eq("id", classId)
    .single();

  if (classError || !classData) {
    return { error: "No se encontró la clase." };
  }

  if (classData.is_full) {
    return { error: "La clase ya está llena (Sala Llena)." };
  }

  // Contar reservas actuales si hay capacidad máxima
  if (classData.max_capacity) {
    const { count, error: countError } = await supabase
      .from("class_reservations")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "confirmed");

    if (countError) {
      return { error: "Error al verificar cupos." };
    }

    if (count !== null && count >= classData.max_capacity) {
      // Auto-update to is_full = true since it reached max capacity
      await supabase.from("classes").update({ is_full: true }).eq("id", classId);
      return { error: "Lo sentimos, ya no quedan cupos disponibles." };
    }
  }

  // Crear la reserva
  const { error } = await supabase
    .from("class_reservations")
    .insert({
      class_id: classId,
      student_id: user.id,
      status: "confirmed",
    });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya tienes una reserva para esta clase." };
    }
    return { error: error.message };
  }

  // Revalidar rutas para actualizar UI
  revalidatePath("/clases");
  revalidatePath("/profesores/[id]", "page");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function cancelReservation(reservationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  const { error } = await supabase
    .from("class_reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId)
    .eq("student_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/clases");
  return { success: true };
}
