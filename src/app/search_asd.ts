import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gvjtospjcwjilvngsvty.supabase.co";
const supabaseKey = "sb_publishable_-8fwU5Gy9pRoPchRgnoBPA_1i2uHh9I";
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchAsd() {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .ilike("title", "%asd%");

  if (error) {
    console.error("Error searching classes:", error);
    return;
  }

  console.log("SEARCH_RESULTS_START");
  console.log(JSON.stringify(data));
  console.log("SEARCH_RESULTS_END");
}

searchAsd();
