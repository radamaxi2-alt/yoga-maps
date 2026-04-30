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

export async function reserveMonthlyPack(baseClassId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para reservar." };
  }

  // 1. Obtener info de la clase base
  const { data: baseClass, error: baseError } = await supabase
    .from("classes")
    .select("*")
    .eq("id", baseClassId)
    .single();

  if (baseError || !baseClass) return { error: "No se encontró la clase base." };

  const baseDate = new Date(baseClass.scheduled_at);
  const dayOfWeek = baseDate.getDay();

  // 2. Buscar clases similares en las próximas 4 semanas (mismo estilo, mismo día, mismo profesor)
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + 30); // Próximos 30 días

  const { data: futureClasses, error: futureError } = await supabase
    .from("classes")
    .select("id, scheduled_at, max_capacity, is_full")
    .eq("teacher_id", baseClass.teacher_id)
    .eq("style", baseClass.style)
    .gte("scheduled_at", baseClass.scheduled_at)
    .lte("scheduled_at", endDate.toISOString())
    .order("scheduled_at", { ascending: true });

  if (futureError || !futureClasses) return { error: "Error al buscar clases futuras." };

  // Filtrar por mismo día de la semana (por si hay clases del mismo estilo otros días)
  const sameDayClasses = futureClasses.filter(c => new Date(c.scheduled_at).getDay() === dayOfWeek);

  if (sameDayClasses.length === 0) return { error: "No se encontraron clases futuras para este horario." };

  // 3. Intentar reservar en todas
  const results = [];
  for (const cls of sameDayClasses) {
    if (cls.is_full) continue; // Saltamos las llenas

    const { error: resError } = await supabase
      .from("class_reservations")
      .insert({
        class_id: cls.id,
        student_id: user.id,
        status: "confirmed",
      });
    
    if (!resError) results.push(cls.id);
  }

  if (results.length === 0) {
    return { error: "No se pudo realizar ninguna reserva (clases llenas o ya reservadas)." };
  }

  revalidatePath("/clases");
  revalidatePath("/profesores/[id]", "page");
  revalidatePath("/dashboard");

  return { success: true, count: results.length };
}
