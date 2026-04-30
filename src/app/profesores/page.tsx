import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ProfesoresView from "./ProfesoresView";

export const metadata: Metadata = {
  title: "Profesores",
  description:
    "Encuentra profesores de yoga verificados cerca de ti. Explora perfiles, estilos y horarios.",
};

export default async function ProfesoresPage() {
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("teacher_details")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  const { data: classes } = await supabase
    .from("classes")
    .select("id, title, latitude, longitude, address, teacher_id, is_full, jitsi_room_link, style")
    .not("latitude", "is", null); // Only fetch classes with a specific location

  return <ProfesoresView teachers={teachers || []} classes={classes || []} hideMap={true} />;
}
