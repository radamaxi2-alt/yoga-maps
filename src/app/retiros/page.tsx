import { createClient } from "@/lib/supabase/server";
import EventListView from "@/components/EventListView";

export const dynamic = "force-dynamic";

export default async function RetirosPage() {
  const supabase = await createClient();
  
  const { data: events } = await supabase
    .from("classes")
    .select("*")
    .eq("category", "retiro")
    .order("scheduled_at", { ascending: true });

  return (
    <EventListView 
      events={events || []} 
      title="Retiros de Yoga" 
      subtitle="Escapadas espirituales y retiros de silencio en Mar del Plata y alrededores."
    />
  );
}
