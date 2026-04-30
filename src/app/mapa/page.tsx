import { createClient } from "@/lib/supabase/server";
import ProfesoresView from "@/app/profesores/ProfesoresView";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const supabase = await createClient();
  
  const { data: teachersRaw } = await supabase
    .from("profiles")
    .select("*, teacher_details(*)")
    .in("role", ["profesor", "escuela"])
    .order("community_score", { ascending: false });

  // Reshape to match ProfesoresView expectations
  const teachers = (teachersRaw || []).map((p: any) => ({
    ...(p.teacher_details || {}),
    id: p.id,
    bio: p.teacher_details?.bio || "",
    specialties: p.teacher_details?.specialties || [],
    profiles: {
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      community_score: p.community_score
    }
  }));

  const { data: classes } = await supabase
    .from("classes")
    .select("*");

  return (
    <div className="bg-surface-dark-alt min-h-screen">
      <ProfesoresView 
        teachers={(teachers as any) || []} 
        classes={(classes as any) || []} 
        hideMap={false}
      />
    </div>
  );
}
