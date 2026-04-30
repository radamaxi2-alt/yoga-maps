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
};

export async function updateTeacherProfile(data: ProfileData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  // Update profile name
  if (data.full_name) {
    await supabase
      .from("profiles")
      .update({ full_name: data.full_name })
      .eq("id", user.id);
  }

  const updateData = {
    teacher_type: data.teacher_type,
    bio: data.bio || null,
    specialties: data.specialties.length > 0 ? data.specialties : null,
    address: data.address || null,
    average_price: data.average_price,
    latitude: data.latitude,
    longitude: data.longitude,
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

  redirect(`/profesores/${user.id}`);
}
