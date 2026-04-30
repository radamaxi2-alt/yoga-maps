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

  const { data: teachersRaw } = await supabase
    .from("profiles")
    .select("*, teacher_details(*)")
    .in("role", ["profesor", "escuela"])
    .order("community_score", { ascending: false });

  // Reshape to match ProfesoresView expectations
  const teachers = (teachersRaw || []).map((p: any) => ({
    ...p.teacher_details,
    id: p.id,
    profiles: {
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      community_score: p.community_score
    }
  }));

  const { data: classes } = await supabase
    .from("classes")
    .select("id, title, latitude, longitude, address, teacher_id, is_full, jitsi_room_link, style")
    .not("latitude", "is", null); // Only fetch classes with a specific location

  return <ProfesoresView teachers={teachers || []} classes={classes || []} hideMap={true} />;
}
