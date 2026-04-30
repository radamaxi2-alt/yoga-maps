import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import NuevaClaseForm from "./NuevaClaseForm";

export const metadata: Metadata = {
  title: "Nueva Clase",
  description: "Publicá una nueva clase de yoga.",
};

export default async function NuevaClasePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify teacher
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "profesor") redirect("/");

  // Verify teacher_details exist
  const { data: details } = await supabase
    .from("teacher_details")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!details) redirect("/onboarding/profesor");

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-foreground/50 transition-colors hover:text-brand-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al dashboard
      </Link>

      <div className="mt-6 rounded-2xl border border-brand-100/50 bg-white/70 p-8 shadow-xl shadow-brand-500/5 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark-alt/70">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Nueva Clase</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Completá los datos para publicar una clase en la agenda.
          </p>
        </div>

        <NuevaClaseForm />
      </div>
    </section>
  );
}
