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

  const { data: teachersRaw, error: profError } = await supabase
    .from("profiles")
    .select("*, teacher_details(*)")
    .in("role", ["profesor", "escuela"]);

  if (profError) console.error("Error fetching profiles:", profError);
  console.log(`[DEBUG] Se encontraron ${teachersRaw?.length || 0} perfiles profesionales.`);
  if (teachersRaw && teachersRaw.length > 0) {
    console.log(`[DEBUG] Primer perfil: ${teachersRaw[0].full_name} (${teachersRaw[0].role})`);
  }

  // Reshape to match ProfesoresView expectations
  const teachers = (teachersRaw || []).map((p: any) => {
    // Supabase might return teacher_details as an array or an object depending on the FK config
    const details = Array.isArray(p.teacher_details) ? p.teacher_details[0] : p.teacher_details;
    
    return {
      ...(details || {}),
      id: p.id,
      bio: details?.bio || "",
      specialties: details?.specialties || [],
      profiles: {
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        community_score: p.community_score
      }
    };
  });

  const { data: classes } = await supabase
    .from("classes")
    .select("id, title, latitude, longitude, address, teacher_id, is_full, jitsi_room_link, style")
    .not("latitude", "is", null);

  return <ProfesoresView teachers={teachers} classes={classes || []} hideMap={true} />;
}
