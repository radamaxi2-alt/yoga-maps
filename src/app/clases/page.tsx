import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ClassesView from "./ClassesView";

export const metadata: Metadata = {
  title: "Agenda de Clases | Yoga Maps",
  description: "Consulta la agenda de clases de yoga. Filtra por estilo, horario y ubicación.",
};

export default async function ClasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: classes } = await supabase
    .from("classes")
    .select("*, teacher_details(profiles(full_name, avatar_url))")
    .eq("category", "Clase")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  let userReservations: Set<string> = new Set();
  let reservationCounts: Record<string, { presential: number; online: number }> = {};

  if (classes && classes.length > 0) {
    const classIds = classes.map(c => c.id);
    const { data: allRes } = await supabase
      .from("class_reservations")
      .select("class_id, modality")
      .eq("status", "confirmed")
      .in("class_id", classIds);
      
    if (allRes) {
      allRes.forEach(r => {
        if (!reservationCounts[r.class_id]) {
          reservationCounts[r.class_id] = { presential: 0, online: 0 };
        }
        if (r.modality === 'presential') reservationCounts[r.class_id].presential++;
        if (r.modality === 'online') reservationCounts[r.class_id].online++;
      });
    }

    if (user) {
      const { data: myRes } = await supabase
        .from("class_reservations")
        .select("class_id")
        .eq("student_id", user.id)
        .eq("status", "confirmed")
        .in("class_id", classIds);
      
      if (myRes) {
        myRes.forEach(r => userReservations.add(r.class_id));
      }
    }
  }

  return (
    <ClassesView 
      initialClasses={classes || []} 
      userReservations={userReservations}
      reservationCounts={reservationCounts}
    />
  );
}
