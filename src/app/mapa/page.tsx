import { createClient } from "@/lib/supabase/server";
import ProfesoresView from "@/app/profesores/ProfesoresView";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const supabase = await createClient();
  
  const { data: teachers } = await supabase
    .from("teacher_details")
    .select("*, profiles(full_name, avatar_url, community_score)")
    .order("community_score", { referencedTable: "profiles", ascending: false });

  const { data: classes } = await supabase
    .from("classes")
    .select("*");

  return (
    <div className="bg-surface">
      <ProfesoresView 
        teachers={teachers as any} 
        classes={classes as any} 
        hideMap={false}
      />
    </div>
  );
}
