import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gvjtospjcwjilvngsvty.supabase.co";
const supabaseKey = "sb_publishable_-8fwU5Gy9pRoPchRgnoBPA_1i2uHh9I";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTeacherClasses() {
  const teacherId = "ad66913f-8ceb-4818-b406-868b6306d54e";
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("Error fetching classes:", error);
    return;
  }

  console.log("TEACHER_CLASSES_START");
  console.log(JSON.stringify(data));
  console.log("TEACHER_CLASSES_END");
}

checkTeacherClasses();
