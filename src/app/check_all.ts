import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gvjtospjcwjilvngsvty.supabase.co";
const supabaseKey = "sb_publishable_-8fwU5Gy9pRoPchRgnoBPA_1i2uHh9I";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllClasses() {
  const { data, error } = await supabase
    .from("classes")
    .select("id, title, capacity_online, teacher_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return;
  }

  console.log("ALL_CLASSES_START");
  console.log(JSON.stringify(data));
  console.log("ALL_CLASSES_END");
}

checkAllClasses();
