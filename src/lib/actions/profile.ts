"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ProfileData = {
  teacher_type: string;
  full_name: string;
  bio: string | null;
  specialties: string[];
  address: string | null;
  average_price: number | null;
  latitude: number | null;
  longitude: number | null;
  cover_image: string | null;
  avatar_url: string | null;
};

export async function updateTeacherProfile(data: ProfileData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  // Update profile name and avatar
  await supabase
    .from("profiles")
    .update({ 
      full_name: data.full_name,
      avatar_url: data.avatar_url
    })
    .eq("id", user.id);

  const updateData = {
    teacher_type: data.teacher_type,
    bio: data.bio || null,
    specialties: data.specialties.length > 0 ? data.specialties : null,
    address: data.address || null,
    average_price: data.average_price,
    latitude: data.latitude,
    longitude: data.longitude,
    cover_image: data.cover_image,
  };

  // Upsert: insert if not exists, update if exists
  const { data: existing } = await supabase
    .from("teacher_details")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("teacher_details")
      .update(updateData)
      .eq("id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("teacher_details")
      .insert({ id: user.id, ...updateData });
    if (error) return { error: error.message };
  }

  redirect("/dashboard");
}

export async function uploadTeacherAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No se seleccionó ningún archivo." };

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

  // Upload to 'avatars' bucket (assuming it exists or using public bucket)
  const { error: uploadError } = await supabase.storage
    .from("teacher-covers") // reusing bucket for simplicity if not separate
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: `Error al subir: ${uploadError.message}` };

  const { data: { publicUrl } } = supabase.storage
    .from("teacher-covers")
    .getPublicUrl(fileName);

  // Update profiles table
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  return { url: publicUrl };
}

export type StudentProfileData = {
  full_name: string;
  bio: string | null;
  health_info: string | null;
};

export async function updateStudentProfile(data: StudentProfileData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  if (data.full_name) {
    await supabase
      .from("profiles")
      .update({ full_name: data.full_name })
      .eq("id", user.id);
  }

  const updateData = {
    bio: data.bio || null,
    health_info: data.health_info || null,
  };

  const { data: existing } = await supabase
    .from("student_details")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("student_details")
      .update(updateData)
      .eq("id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("student_details")
      .insert({ id: user.id, ...updateData });
    if (error) return { error: error.message };
  }

  redirect("/dashboard");
}

export async function uploadTeacherCover(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No se seleccionó ningún archivo." };

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/cover-${Date.now()}.${fileExt}`;

  // Upload to 'teacher-covers' bucket
  const { error: uploadError } = await supabase.storage
    .from("teacher-covers")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: `Error al subir: ${uploadError.message}` };

  const { data: { publicUrl } } = supabase.storage
    .from("teacher-covers")
    .getPublicUrl(fileName);

  // Update teacher_details
  const { error: updateError } = await supabase
    .from("teacher_details")
    .update({ cover_image: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  return { url: publicUrl };
}
