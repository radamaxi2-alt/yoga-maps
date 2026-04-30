import { createClient } from "@/lib/supabase/server";
import EventListView from "@/components/EventListView";

export const dynamic = "force-dynamic";

export default async function FormacionesPage() {
  const supabase = await createClient();
  
  const { data: events } = await supabase
    .from("classes")
    .select("*")
    .eq("category", "formacion")
    .order("scheduled_at", { ascending: true });

  return (
    <EventListView 
      events={events || []} 
      title="Formaciones" 
      subtitle="Profesorados y certificaciones para llevar tu conocimiento de yoga al siguiente nivel."
    />
  );
}
