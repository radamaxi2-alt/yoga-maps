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

  if (!teachers || !classes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-dark-alt">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-brand-100/60 animate-pulse">Sincronizando Mar del Plata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark-alt min-h-screen">
      <ProfesoresView 
        teachers={teachers as any} 
        classes={classes as any} 
        hideMap={false}
      />
    </div>
  );
}
