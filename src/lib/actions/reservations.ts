"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendReservationEmail } from "@/lib/email";

export async function reserveClass(classId: string, modality: 'presential' | 'online' = 'presential') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para reservar una clase." };
  }

  // Fetch student info
  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("full_name, student_details(health_info)")
    .eq("id", user.id)
    .single();

  // Verificar si hay cupo disponible
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("*, teacher_details(id, profiles(full_name))")
    .eq("id", classId)
    .single();

  if (classError || !classData) {
    return { error: "No se encontró la clase." };
  }

  // Capacidad híbrida
  const maxCapacity = modality === 'presential' 
    ? (classData.capacity_presential || 0) 
    : (classData.capacity_online || 0);

  // Contar reservas actuales para esta modalidad
  const { count, error: countError } = await supabase
    .from("class_reservations")
    .select("*", { count: "exact", head: true })
    .eq("class_id", classId)
    .eq("modality", modality)
    .eq("status", "confirmed");

  if (!countError && count !== null && count >= maxCapacity) {
    return { error: `Lo sentimos, ya no quedan cupos ${modality === 'presential' ? 'presenciales' : 'online'} para esta clase.` };
  }

  // Crear la reserva
  const { error } = await supabase
    .from("class_reservations")
    .insert({
      class_id: classId,
      student_id: user.id,
      modality: modality,
      status: "confirmed",
    });

  if (error) {
    if (error.code === "23505") return { error: "Ya tienes una reserva para esta clase." };
    return { error: error.message };
  }

  // Trigger notification
  const teacherEmail = `${classData.teacher_id}@yoga-maps-temp.com`;
  const teacherName = (classData.teacher_details as any)?.profiles?.full_name || "Profesor";

  await sendReservationEmail({
    teacherEmail,
    teacherName,
    studentName: studentProfile?.full_name || "Un alumno",
    healthInfo: (studentProfile?.student_details as any)?.health_info || null,
    classTitle: classData.title,
    classTime: classData.start_time,
  });

  revalidatePath("/clases");
  revalidatePath("/profesores/[id]", "page");
  revalidatePath("/dashboard");

  return { 
    success: true, 
    message: "¡Reserva confirmada! El profesor ha sido notificado y tiene acceso a tu ficha médica para cuidarte en clase." 
  };
}

export async function reserveMonthlyPack(baseClassId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para reservar." };
  }

  // 1. Obtener los detalles de la clase base
  const { data: baseClass, error: baseError } = await supabase
    .from("classes")
    .select("*")
    .eq("id", baseClassId)
    .single();

  if (baseError || !baseClass) return { error: "Clase no encontrada." };

  // 2. Buscar clases similares del mismo profesor y estilo en el mismo día de la semana
  // para los próximos 30 días
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);

  const { data: futureClasses, error: futureError } = await supabase
    .from("classes")
    .select("id, max_capacity, is_full")
    .eq("teacher_id", baseClass.teacher_id)
    .eq("style", baseClass.style)
    .eq("day_of_week", baseClass.day_of_week)
    .gte("scheduled_at", today.toISOString())
    .lte("scheduled_at", nextMonth.toISOString());

  if (futureError || !futureClasses || futureClasses.length === 0) {
    return { error: "No se encontraron clases recurrentes para el próximo mes." };
  }

  // 3. Intentar reservar cada clase (que tenga cupo)
  let successfulReservations = 0;
  for (const cls of futureClasses) {
    if (cls.is_full) continue;

    const { error: resError } = await supabase
      .from("class_reservations")
      .insert({
        class_id: cls.id,
        student_id: user.id,
        status: "confirmed"
      });

    if (!resError) successfulReservations++;
  }

  if (successfulReservations === 0) {
    return { error: "No se pudo realizar ninguna reserva (clases llenas o ya reservadas)." };
  }

  revalidatePath("/clases");
  revalidatePath("/profesores/[id]", "page");
  revalidatePath("/dashboard");

  return { 
    success: true, 
    message: `¡Pase Mensual activado! Hemos reservado ${successfulReservations} clases para los próximos 30 días.` 
  };
}
