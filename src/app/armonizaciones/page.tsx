import { createClient } from "@/lib/supabase/server";
import EventListView from "@/components/EventListView";

export const dynamic = "force-dynamic";

export default async function ArmonizacionesPage() {
  const supabase = await createClient();
  
  const { data: events } = await supabase
    .from("classes")
    .select("*")
    .eq("category", "armonizacion")
    .order("scheduled_at", { ascending: true });

  return (
    <EventListView 
      events={events || []} 
      title="Armonizaciones" 
      subtitle="Sesiones de cuencos, baños de gong y meditación sonora en Mar del Plata."
    />
  );
}
