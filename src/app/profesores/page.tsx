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

  // FORCE VISIBILITY: Query profiles directly with no complex ordering initially
  const { data: teachersRaw, error: profError } = await supabase
    .from("profiles")
    .select("*, teacher_details(*)")
    .eq("role", "profesor");

  if (profError) console.error("[CRITICAL] Error fetching profiles:", profError);
  console.log(`[DEBUG] Query de Profesores: ${teachersRaw?.length || 0} encontrados.`);

  // Infalible Mapping
  const teachers = (teachersRaw || []).map((p: any) => {
    const details = Array.isArray(p.teacher_details) ? p.teacher_details[0] : p.teacher_details;
    return {
      ...(details || {}),
      id: p.id,
      bio: details?.bio || "",
      specialties: details?.specialties || [],
      address: details?.address || "Mar del Plata",
      profiles: {
        id: p.id,
        full_name: p.full_name || "Instructor de Yoga",
        avatar_url: p.avatar_url || "",
        community_score: p.community_score || 0
      }
    };
  });

  const { data: classes } = await supabase
    .from("classes")
    .select("*");

  return <ProfesoresView teachers={teachers} classes={classes || []} hideMap={true} />;
}
