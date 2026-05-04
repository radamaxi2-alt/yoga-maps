import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gvjtospjcwjilvngsvty.supabase.co";
const supabaseKey = "sb_publishable_-8fwU5Gy9pRoPchRgnoBPA_1i2uHh9I";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .ilike("full_name", "%Maxi%");

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log("PROFILES_START");
  console.log(JSON.stringify(data));
  console.log("PROFILES_END");
}

checkProfiles();
