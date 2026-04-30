import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos, reflexiones y motivación sobre yoga.",
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if current user is a teacher to show "New Post" button
  let isTeacher = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "profesor") isTeacher = true;
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-brand-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-semibold tracking-wider uppercase">Inspiración</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl text-foreground">
            Inspiración & Energía
          </h1>
          <p className="mt-4 text-lg text-foreground/70 font-sans">
            Reflexiones, técnicas y motivación escritas por nuestra comunidad de profesores.
          </p>
        </div>
        {isTeacher && (
          <Link
            href="/blog/nuevo"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:scale-105 hover:bg-brand-500"
          >
            ✏️ Escribir Artículo
          </Link>
        )}
      </div>

      {posts && posts.length > 0 ? (
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const date = new Date(post.created_at);
            const author = post.profiles as { full_name: string | null; avatar_url: string | null } | null;
            
            return (
              <article
                key={post.id}
                className="glass group flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
              >
                {/* Image */}
                <div className="relative h-48 w-full shrink-0 overflow-hidden bg-brand-50">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      🪷
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-foreground/50 font-sans">
                    <time dateTime={post.created_at}>
                      {date.toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  
                  <h3 className="mt-3 text-xl font-bold text-foreground group-hover:text-brand-600">
                    {post.title}
                  </h3>
                  
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/70 font-sans">
                    {post.content}
                  </p>
                  
                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                        {author?.avatar_url ? (
                          <img src={author.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold">{(author?.full_name?.[0] || "Y").toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground/80 font-sans">
                        {author?.full_name || "Profesor"}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-24 text-center">
          <span className="inline-block text-6xl">🪷</span>
          <h3 className="mt-6 text-xl font-semibold text-foreground">El blog está en silencio...</h3>
          <p className="mt-2 text-foreground/60 font-sans">Pronto nuestros profesores compartirán su sabiduría.</p>
        </div>
      )}
    </section>
  );
}
