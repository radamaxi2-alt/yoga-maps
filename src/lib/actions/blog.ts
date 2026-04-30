"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type BlogState = {
  error?: string;
};

export async function createPost(
  _prevState: BlogState,
  formData: FormData
): Promise<BlogState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No estás autenticado." };

  const { error } = await supabase.from("posts").insert({
    author_id: user.id,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image_url: (formData.get("image_url") as string) || null,
  });

  if (error) return { error: error.message };

  redirect("/blog");
}
