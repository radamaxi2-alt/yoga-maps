"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { updateStudentProfile } from "@/lib/actions/profile";
import type { StudentDetail } from "@/lib/database.types";

type FormData = {
  full_name: string;
  bio: string;
  health_info: string;
};

export default function StudentProfileForm({
  fullName,
  details,
}: {
  fullName: string;
  details: StudentDetail | null;
}) {
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      full_name: fullName,
      bio: details?.bio || "",
      health_info: details?.health_info || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    
    const result = await updateStudentProfile(data);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Completá tu información. Tu estado de salud solo será visible para el profesor al reservar una clase.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <fieldset>
            <label className="mb-1 block text-sm font-medium text-foreground/80">
              Nombre completo
            </label>
            <input
              type="text"
              {...register("full_name", { required: true })}
              className="w-full rounded-xl border border-brand-200/60 bg-white/60 p-3 text-sm text-foreground backdrop-blur-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
              placeholder="Tu nombre y apellido"
            />
          </fieldset>

          <fieldset>
            <label className="mb-1 block text-sm font-medium text-foreground/80">
              Biografía Corta
            </label>
            <p className="mb-2 text-xs text-foreground/50">Contá un poco sobre tu experiencia previa con el yoga.</p>
            <textarea
              {...register("bio")}
              rows={3}
              className="w-full resize-none rounded-xl border border-brand-200/60 bg-white/60 p-3 text-sm text-foreground backdrop-blur-sm transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
              placeholder="Ej: Empecé hace dos años y me encanta el ashtanga..."
            />
          </fieldset>

          <fieldset>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">❤️</span>
              <label className="text-sm font-medium text-foreground/80">
                Información de Salud (Confidencial)
              </label>
            </div>
            <p className="mb-2 text-xs text-foreground/50">
              Detalla cualquier lesión (ej. rodillas, espalda), dolores frecuentes o condiciones como presión alta. Esto ayudará al profesor a cuidar tu práctica. Solo los profesores de las clases que reserves podrán ver esto.
            </p>
            <textarea
              {...register("health_info")}
              rows={4}
              className="w-full resize-none rounded-xl border border-red-200/60 bg-white/60 p-3 text-sm text-foreground backdrop-blur-sm transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 dark:border-red-900/50 dark:bg-surface-dark/50"
              placeholder="No tengo lesiones / Sufro de dolor lumbar crónico..."
            />
          </fieldset>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Perfil"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
