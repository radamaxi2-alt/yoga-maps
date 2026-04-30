"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/database.types";

const ROLE_OPTIONS: { value: UserRole; label: string; emoji: string; description: string }[] = [
  {
    value: "alumno",
    label: "Alumno",
    emoji: "🧘",
    description: "Quiero encontrar clases y profesores de yoga.",
  },
  {
    value: "profesor",
    label: "Profesor",
    emoji: "🪷",
    description: "Soy profesor y quiero ofrecer mis clases.",
  },
];

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleConfirm() {
    if (!selectedRole) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", user.id);

      if (error) throw error;

      if (selectedRole === "profesor") {
        router.push("/onboarding/profesor");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error setting role:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-xl">
          <div className="mb-8 text-center">
            <span className="text-4xl">✨</span>
            <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">
              ¡Bienvenido a Yoga Maps!
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Para empezar, cuéntanos cómo usarás la plataforma:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedRole(opt.value)}
                className={`relative flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                  selectedRole === opt.value
                    ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10"
                    : "border-brand-100/60 bg-white/50 hover:border-brand-200"
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div>
                  <p className="font-bold text-foreground">{opt.label}</p>
                  <p className="text-xs text-foreground/50">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selectedRole || isSubmitting}
            className="mt-8 w-full rounded-full bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-500 disabled:opacity-50"
          >
            {isSubmitting ? "Configurando..." : "Confirmar y Continuar"}
          </button>
        </div>
      </div>
    </section>
  );
}
