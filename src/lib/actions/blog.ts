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

  let imageUrl = null;
  const imageFile = formData.get("image") as File;

  // Handle image upload if a file is provided
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { error: `Error al subir la imagen: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);
    
    imageUrl = publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    author_id: user.id,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image_url: imageUrl,
  });

  if (error) return { error: error.message };

  redirect("/blog");
}
