"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const styleSelect = formData.get("style_select") as string;
  const customStyle = formData.get("custom_style") as string;
  const style = styleSelect === "Otro" ? customStyle : styleSelect;

  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const maxCapStr = formData.get("max_capacity") as string;
  const category = formData.get("category") as string;
  const certification_title = formData.get("certification_title") as string;

  const { error } = await supabase.from("classes").insert({
    teacher_id: user.id,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    price: parseFloat(formData.get("price") as string) || 0,
    scheduled_at: formData.get("scheduled_at") as string,
    jitsi_room_link: (formData.get("jitsi_room_link") as string) || null,
    style: style || null,
    instructor_name: (formData.get("instructor_name") as string) || null,
    max_capacity: maxCapStr ? parseInt(maxCapStr) : null,
    is_full: formData.get("is_full") === "on",
    address: (formData.get("address") as string) || null,
    latitude: latStr ? parseFloat(latStr) : null,
    longitude: lngStr ? parseFloat(lngStr) : null,
    category: category || "clase",
    certification_title: certification_title || null,
  });

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

  const styleSelect = formData.get("style_select") as string;
  const customStyle = formData.get("custom_style") as string;
  const style = styleSelect === "Otro" ? customStyle : styleSelect;

  const latStr = formData.get("latitude") as string;
  const lngStr = formData.get("longitude") as string;
  const maxCapStr = formData.get("max_capacity") as string;

  const { error } = await supabase
    .from("classes")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      price: parseFloat(formData.get("price") as string) || 0,
      scheduled_at: formData.get("scheduled_at") as string,
      jitsi_room_link: (formData.get("jitsi_room_link") as string) || null,
      style: style || null,
      instructor_name: (formData.get("instructor_name") as string) || null,
      max_capacity: maxCapStr ? parseInt(maxCapStr) : null,
      is_full: formData.get("is_full") === "on",
      address: (formData.get("address") as string) || null,
      latitude: latStr ? parseFloat(latStr) : null,
      longitude: lngStr ? parseFloat(lngStr) : null,
      category: (formData.get("category") as string) || "clase",
      certification_title: (formData.get("certification_title") as string) || null,
    })
    .eq("id", classId)
    .eq("teacher_id", user.id);

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
