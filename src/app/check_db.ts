import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gvjtospjcwjilvngsvty.supabase.co";
const supabaseKey = "sb_publishable_-8fwU5Gy9pRoPchRgnoBPA_1i2uHh9I";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching classes:", error);
    return;
  }

  if (data && data.length > 0) {
    console.log("COLUMNS_START");
    console.log(JSON.stringify(Object.keys(data[0])));
    console.log("COLUMNS_END");
  } else {
    console.log("No data in 'classes' to check columns.");
  }
}

checkSchema();
