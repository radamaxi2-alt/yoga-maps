import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import BlogInteractions from "@/components/BlogInteractions";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, content")
    .eq("id", id)
    .single();

  if (!post) return { title: "Post no encontrado" };

  return {
    title: post.title,
    description: post.content.substring(0, 150) + "...",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles!author_id(full_name, avatar_url)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const author = (post as any).profiles;

  // Fetch likes count
  const { count: likesCount } = await supabase
    .from("post_likes")
    .select("post_id", { count: "exact", head: true })
    .eq("post_id", id);

  // Check if current user has liked
  let hasLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .single();
    if (like) hasLiked = true;
  }

  const date = new Date(post.created_at);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-foreground/50 transition-colors hover:text-brand-600 mb-8"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al blog
      </Link>

      {/* Header */}
      <header className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
          {post.title}
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-100/50 pb-6 dark:border-surface-dark-alt">
          <Link href={`/profesores/${post.author_id}`} className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 overflow-hidden ring-2 ring-white dark:ring-surface-dark-alt transition-transform group-hover:scale-105">
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold">{(author?.full_name?.[0] || "Y").toUpperCase()}</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-foreground group-hover:text-brand-600 transition-colors">
                {author?.full_name || "Profesor"}
              </p>
              <time dateTime={post.created_at} className="text-xs text-foreground/50">
                {date.toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>
          </Link>

          {/* Interactions Component */}
          <BlogInteractions 
            postId={post.id} 
            initialLikes={likesCount || 0} 
            initialHasLiked={hasLiked} 
            title={post.title}
            isLoggedIn={!!user}
          />
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-brand dark:prose-invert prose-lg max-w-none">
        {post.image_url && (
          <div className="mb-10 w-full overflow-hidden rounded-3xl bg-brand-50 aspect-[16/9] shadow-md ring-1 ring-brand-100/50 dark:bg-surface-dark-alt dark:ring-surface-dark-alt">
            <img
              src={post.image_url}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="whitespace-pre-line text-foreground/80 leading-relaxed font-sans">
          {post.content}
        </div>
      </div>
    </article>
  );
}
