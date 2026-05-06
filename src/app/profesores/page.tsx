import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ProfesoresView from "./ProfesoresView";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Directorio de Profesores | Yoga Maps",
  description: "Encuentra profesores de yoga verificados cerca de ti. Explora perfiles, estilos y horarios.",
};

export default async function ProfesoresPage() {
  const supabase = await createClient();

  const { data: teachersRaw, error: profError } = await supabase
    .from("profiles")
    .select("*, teacher_details(*)")
    .eq("role", "profesor");

  if (profError) console.error("[CRITICAL] Error fetching profiles:", profError);

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

  return (
    <>
      <PageHero 
        title="Nuestros Profesores"
        subtitle="Conectá con instructores verificados y encontrá el guía perfecto para tu camino."
        backgroundImage="/images/hero-profesores.png"
        badge="🧘 Maestros Verificados"
      />
      <ProfesoresView teachers={teachers} classes={classes || []} hideMap={true} />
    </>
  );
}
