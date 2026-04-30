import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const supabase = await createClient();
  
  // Debug log en el servidor
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, profiles!author_id(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-20 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      {posts && posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.id}`} 
              className="glass p-6 rounded-3xl block hover:bg-white/40 transition-all"
            >
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-foreground/60 line-clamp-2 mb-4">{post.content}</p>
              <div className="text-xs font-bold text-brand-600">Por {post.profiles?.full_name || "Profesor"}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-foreground/50">No hay posts publicados aún.</div>
      )}
    </div>
  );
}
