import { createClient } from "@/lib/supabase/server";
import ProfesoresView from "@/app/profesores/ProfesoresView";

export const dynamic = "force-dynamic";

async function getCategoryData(category: string) {
  const supabase = await createClient();
  
  const { data: teachers } = await supabase
    .from("teacher_details")
    .select("*, profiles(full_name, avatar_url)");

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .eq("category", category);

  return { teachers: teachers || [], classes: classes || [] };
}

export default async function FormacionesPage() {
  const { teachers, classes } = await getCategoryData("formacion");

  return (
    <div className="bg-surface">
      <ProfesoresView 
        teachers={teachers as any} 
        classes={classes as any} 
        initialCategory="formacion"
      />
    </div>
  );
}
