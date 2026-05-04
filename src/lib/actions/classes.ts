"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export type ClassState = {
  error?: string;
};

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
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.subscription_plan || "zen";
  // Updated limits according to user request
  const limits = { zen: 12, namaste: 80, escuela: 99999 };
  const limit = limits[plan as keyof typeof limits] || 12;

  const { count } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user.id);

  const currentCount = count || 0;

  // Form Data extraction
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const price = parseFloat(formData.get("price") as string) || 0;
  const scheduledAt = formData.get("scheduled_at") as string;
  const jitsiLink = (formData.get("jitsi_room_link") as string) || null;
  const category = (formData.get("category") as string) || "clase";
  
  const styleSelect = formData.get("style_select") as string;
  const customStyle = formData.get("custom_style") as string;
  const style = styleSelect === "Otro" ? customStyle : styleSelect;

  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const capPresStr = formData.get("capacity_presential") as string;
  const capOnlineStr = formData.get("capacity_online") as string;

  // BUG FIX: Ensure '0' is respected and not defaulted to 10/15
  const capacity_presential = (capPresStr !== null && capPresStr !== "") ? parseInt(capPresStr) : 15;
  const capacity_online = (capOnlineStr !== null && capOnlineStr !== "") ? parseInt(capOnlineStr) : 5;
  const total_capacity = capacity_presential + capacity_online;

  const address = (formData.get("address") as string) || null;
  const latitude = latStr ? parseFloat(latStr) : null;
  const longitude = lngStr ? parseFloat(lngStr) : null;

  // Recurrence logic
  const isRecurring = formData.get("is_recurring") === "on";
  const repeatDays = (formData.get("repeat_days") as string || "").split(",").filter(Boolean);
  const repeatUntil = formData.get("repeat_until") as string;

  const classInstances = [];
  const series_id = isRecurring ? uuidv4() : null;

  if (!isRecurring) {
    if (currentCount >= limit) {
      return { error: `Límite de plan alcanzado (${limit} clases). Mejora tu plan para publicar más.` };
    }
    classInstances.push({
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
      series_id
    });
  } else {
    // Generate recurring instances
    const startDate = new Date(scheduledAt);
    const endDate = new Date(repeatUntil + "T23:59:59");
    const daysToRepeat = repeatDays.map(d => parseInt(d));

    let currentDate = new Date(startDate);
    
    // Safety break to prevent infinite loops or massive inserts
    let safetyCounter = 0;
    while (currentDate <= endDate && safetyCounter < 100) {
      if (daysToRepeat.includes(currentDate.getDay())) {
        classInstances.push({
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
          series_id
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
      safetyCounter++;
    }

    if (currentCount + classInstances.length > limit) {
      return { error: `Esta serie de clases superaría tu límite mensual (${limit} clases). Solo puedes crear ${limit - currentCount} clases más.` };
    }
  }

  const { error } = await supabase.from("classes").insert(classInstances);

  if (error) return { error: error.message };

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

  const styleSelect = formData.get("style_select") as string;
  const customStyle = formData.get("custom_style") as string;
  const style = styleSelect === "Otro" ? customStyle : styleSelect;

  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const capPresStr = formData.get("capacity_presential") as string;
  const capOnlineStr = formData.get("capacity_online") as string;

  const capacity_presential = (capPresStr !== null && capPresStr !== "") ? parseInt(capPresStr) : 15;
  const capacity_online = (capOnlineStr !== null && capOnlineStr !== "") ? parseInt(capOnlineStr) : 5;
  const total_capacity = capacity_presential + capacity_online;

  const updateData = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    price: parseFloat(formData.get("price") as string) || 0,
    scheduled_at: formData.get("scheduled_at") as string,
    jitsi_room_link: (formData.get("jitsi_room_link") as string) || null,
    style: style || null,
    instructor_name: (formData.get("instructor_name") as string) || null,
    capacity_presential,
    capacity_online,
    total_capacity,
    is_full: formData.get("is_full") === "on",
    address: (formData.get("address") as string) || null,
    latitude: latStr ? parseFloat(latStr) : null,
    longitude: lngStr ? parseFloat(lngStr) : null,
    category: (formData.get("category") as string) || "clase",
    certification_title: (formData.get("certification_title") as string) || null,
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
