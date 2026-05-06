"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export type ClassState = {
  error?: string;
};

export async function searchTeachers(query: string) {
  const supabase = await createClient();
  const cleanQuery = query.replace('@', '').toLowerCase();
  
  if (cleanQuery.length < 2) return [];

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, username")
    .eq("role", "profesor")
    .or(`username.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
    .limit(5);

  return data || [];
}

export async function searchSchools(query: string) {
  const supabase = await createClient();
  if (query.length < 2) return [];

  const { data } = await supabase
    .from("teacher_details")
    .select("id, profiles(full_name, avatar_url, username)")
    .eq("teacher_type", "escuela")
    .or(`address.ilike.%${query}%,profiles.full_name.ilike.%${query}%`)
    .limit(5);

  return data?.map((d: any) => ({
    id: d.id,
    full_name: d.profiles.full_name,
    avatar_url: d.profiles.avatar_url,
    username: d.profiles.username
  })) || [];
}

export async function createClass(
  _prevState: ClassState,
  formData: FormData
): Promise<ClassState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, subscription_plan")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "profesor") {
    return { error: "Solo los perfiles de Profesor pueden crear clases. Las Escuelas son ahora centros de vinculación." };
  }

  const plan = profile?.subscription_plan || "zen";
  const limits = { zen: 12, namaste: 80, escuela: 99999 };
  const limit = limits[plan as keyof typeof limits] || 12;

  const { count } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user.id);

  const currentCount = count || 0;

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const price = parseFloat(formData.get("price") as string) || 0;
  const scheduledAt = formData.get("scheduled_at") as string;
  const jitsiLink = (formData.get("jitsi_room_link") as string) || null;
  const category = (formData.get("category") as string) || "clase";
  const guestTeacherIds = formData.get("guest_teacher_ids") ? (formData.get("guest_teacher_ids") as string).split(',').filter(Boolean) : [];
  const schoolId = (formData.get("school_id") as string) || null;
  
  const styleSelect = formData.get("style_select") as string;
  const customStyle = formData.get("custom_style") as string;
  const style = styleSelect === "Otro" ? customStyle : styleSelect;

  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const capPresRaw = formData.get("capacity_presential");
  const capOnlineRaw = formData.get("capacity_online");

  const capacity_presential = (capPresRaw !== null && capPresRaw !== "") ? Number(capPresRaw) : 15;
  const capacity_online = (capOnlineRaw !== null && capOnlineRaw !== "") ? Number(capOnlineRaw) : 5;
  const total_capacity = capacity_presential + capacity_online;

  const address = (formData.get("address") as string) || null;
  const latitude = latStr ? parseFloat(latStr) : null;
  const longitude = lngStr ? parseFloat(lngStr) : null;

  const isRecurring = formData.get("is_recurring") === "on";
  const repeatDays = (formData.get("repeat_days") as string || "").split(",").filter(Boolean);
  const repeatUntil = formData.get("repeat_until") as string;

  const classInstances = [];
  const series_id = isRecurring ? uuidv4() : null;

  if (!isRecurring) {
    if (currentCount >= limit) {
      return { error: `Límite de plan alcanzado (${limit} clases). Mejora tu plan para publicar más.` };
    }
    const newClass: any = {
      teacher_id: user.id,
      title,
      description,
      price,
      scheduled_at: scheduledAt,
      jitsi_room_link: jitsiLink,
      style: style || null,
      capacity_presential,
      capacity_online,
      total_capacity,
      address,
      latitude,
      longitude,
      category,
      guest_teacher_ids: guestTeacherIds,
      school_id: schoolId
    };
    if (series_id) newClass.series_id = series_id;
    classInstances.push(newClass);
  } else {
    const startDate = new Date(scheduledAt);
    const endDate = new Date(repeatUntil + "T23:59:59");
    const daysToRepeat = repeatDays.map(d => parseInt(d));

    let currentDate = new Date(startDate);
    let safetyCounter = 0;
    while (currentDate <= endDate && safetyCounter < 100) {
      if (daysToRepeat.includes(currentDate.getDay())) {
        const newClass: any = {
          teacher_id: user.id,
          title,
          description,
          price,
          scheduled_at: currentDate.toISOString(),
          jitsi_room_link: jitsiLink,
          style: style || null,
          capacity_presential,
          capacity_online,
          total_capacity,
          address,
          latitude,
          longitude,
          category,
          guest_teacher_ids: guestTeacherIds,
          school_id: schoolId
        };
        if (series_id) newClass.series_id = series_id;
        classInstances.push(newClass);
      }
      currentDate.setDate(currentDate.getDate() + 1);
      safetyCounter++;
    }

    if (currentCount + classInstances.length > limit) {
      return { error: `Esta serie de clases superaría tu límite mensual (${limit} clases).` };
    }
  }

  if (classInstances.length === 0) {
    return { error: "No se generaron clases. Revisa que los días seleccionados estén dentro del rango de fechas." };
  }

  const { error } = await supabase.from("classes").insert(classInstances);

  if (error) {
    return { error: "Error al crear la clase: " + error.message };
  }

  redirect("/dashboard");
}

export async function updateClass(
  _prevState: ClassState,
  formData: FormData
): Promise<ClassState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  const classId = formData.get("class_id") as string;
  const updateSeries = formData.get("update_series") === "true";

  const { data: currentClass } = await supabase
    .from("classes")
    .select("series_id, scheduled_at")
    .eq("id", classId)
    .single();

  const title = formData.get("title") as string;
  const capPresRaw = formData.get("capacity_presential");
  const capOnlineRaw = formData.get("capacity_online");
  const guestTeacherIds = formData.get("guest_teacher_ids") ? (formData.get("guest_teacher_ids") as string).split(',').filter(Boolean) : [];

  const capacity_presential = (capPresRaw !== null && capPresRaw !== "") ? Number(capPresRaw) : 15;
  const capacity_online = (capOnlineRaw !== null && capOnlineRaw !== "") ? Number(capOnlineRaw) : 5;
  const total_capacity = capacity_presential + capacity_online;

  const styleSelect = formData.get("style_select") as string;
  const customStyle = formData.get("custom_style") as string;
  const style = styleSelect === "Otro" ? customStyle : styleSelect;

  const updateData: any = {
    title,
    description: (formData.get("description") as string) || null,
    price: parseFloat(formData.get("price") as string) || 0,
    scheduled_at: formData.get("scheduled_at") as string,
    jitsi_room_link: (formData.get("jitsi_room_link") as string) || null,
    style: style || null,
    capacity_presential,
    capacity_online,
    total_capacity,
    is_full: formData.get("is_full") === "on",
    address: (formData.get("address") as string) || null,
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
    category: (formData.get("category") as string) || "clase",
    guest_teacher_ids: guestTeacherIds,
    school_id: (formData.get("school_id") as string) || null
  };

  let query = supabase.from("classes").update(updateData);

  if (updateSeries && currentClass?.series_id) {
    query = query
      .eq("series_id", currentClass.series_id)
      .gte("scheduled_at", currentClass.scheduled_at);
  } else {
    query = query.eq("id", classId);
  }

  const { error } = await query.eq("teacher_id", user.id);

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function deleteClass(classId: string): Promise<ClassState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId)
    .eq("teacher_id", user.id);

  if (error) return { error: error.message };

  redirect("/dashboard");
}
