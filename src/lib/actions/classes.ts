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

  const { error } = await supabase.from("classes").insert({
    teacher_id: user.id,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    price: parseFloat(formData.get("price") as string) || 0,
    scheduled_at: formData.get("scheduled_at") as string,
    jitsi_room_link: (formData.get("jitsi_room_link") as string) || null,
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

  const { error } = await supabase
    .from("classes")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      price: parseFloat(formData.get("price") as string) || 0,
      scheduled_at: formData.get("scheduled_at") as string,
      jitsi_room_link: (formData.get("jitsi_room_link") as string) || null,
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
