import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import NuevoPostForm from "./NuevoPostForm";

export const metadata: Metadata = {
  title: "Nuevo Artículo",
  description: "Publica un nuevo artículo en el blog.",
};

export default async function NuevoPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "profesor") redirect("/blog");

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-foreground/50 transition-colors hover:text-brand-600 font-sans"
      >
        &larr; Volver al blog
      </Link>

      <div className="glass mt-6 rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand-500/5">
        <div className="mb-8">
          <div className="flex items-center justify-center text-brand-500 text-3xl mb-4">🪷</div>
          <h1 className="text-3xl font-bold text-foreground text-center">Escribir Artículo</h1>
          <p className="mt-2 text-center text-sm text-foreground/60 font-sans">
            Comparte tu conocimiento y energía con la comunidad.
          </p>
        </div>

        <NuevoPostForm />
      </div>
    </section>
  );
}
