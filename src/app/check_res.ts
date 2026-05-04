import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gvjtospjcwjilvngsvty.supabase.co";
const supabaseKey = "sb_publishable_-8fwU5Gy9pRoPchRgnoBPA_1i2uHh9I";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllReservations() {
  const { data, error } = await supabase
    .from("class_reservations")
    .select("*, classes(title)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reservations:", error);
    return;
  }

  console.log("RESERVATIONS_START");
  console.log(JSON.stringify(data));
  console.log("RESERVATIONS_END");
}

checkAllReservations();
