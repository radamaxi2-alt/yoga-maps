import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const supabase = await createClient();
  
  // Query corregida con la relación explícita author_id
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, profiles!author_id(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-red-500 font-medium">Error al cargar el blog: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-16 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Yoga Blog
        </h1>
        <p className="mt-4 text-lg text-foreground/60">
          Reflexiones, consejos y motivación para tu práctica diaria.
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.id}`} 
              className="group glass flex flex-col overflow-hidden rounded-[2rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                    {post.profiles?.full_name?.[0]?.toUpperCase() || "Y"}
                  </div>
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                    {post.profiles?.full_name || "Instructor"}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold leading-tight text-foreground group-hover:text-brand-600 transition-colors">
                  {post.title}
                </h2>
                
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-foreground/60">
                  {post.content}
                </p>
                
                <div className="mt-8 flex items-center justify-between border-t border-brand-100/30 pt-6">
                  <span className="text-[10px] font-medium text-foreground/40">
                    {new Date(post.created_at).toLocaleDateString("es-AR")}
                  </span>
                  <span className="text-xs font-bold text-brand-500 group-hover:translate-x-1 transition-transform">
                    Leer más →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-brand-100 bg-brand-50/30 py-32 text-center">
          <p className="text-foreground/40 font-medium">Aún no hay publicaciones en el blog.</p>
        </div>
      )}
    </div>
  );
}
