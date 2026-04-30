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

  return <ProfesoresView teachers={teachers || []} />;
}
