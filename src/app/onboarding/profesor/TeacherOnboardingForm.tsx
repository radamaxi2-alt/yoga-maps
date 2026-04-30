"use client";

import { useActionState } from "react";
import {
  completeTeacherProfile,
  type AuthState,
} from "@/lib/actions/auth";

import { YOGA_SPECIALTIES } from "@/lib/constants";

export default function TeacherOnboardingForm({
  userName,
}: {
  userName: string;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    completeTeacherProfile,
    {}
  );

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-brand-100/50 bg-white/70 p-8 shadow-xl shadow-brand-500/5 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark-alt/70">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl text-white shadow-lg shadow-brand-500/25">
            🪷
          </span>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            ¡Bienvenido, {userName}!
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Completá tu perfil de profesor para que los alumnos puedan
            encontrarte.
          </p>
        </div>

        {state.error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Sobre vos
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Contá sobre tu experiencia, formación y qué pueden esperar tus alumnos..."
              className="w-full resize-none rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
          </div>

          {/* Specialties */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-foreground/80">
              Especialidades
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {YOGA_SPECIALTIES.map((spec) => (
                <label
                  key={spec}
                  className="group relative cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="specialties"
                    value={spec}
                    className="peer sr-only"
                  />
                  <div className="rounded-lg border border-brand-100/60 bg-surface-alt/30 px-3 py-2 text-center text-sm transition-all duration-200 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:font-medium peer-checked:text-brand-700 hover:border-brand-200 dark:border-surface-dark-alt dark:bg-surface-dark/30 dark:peer-checked:border-brand-500 dark:peer-checked:bg-brand-900/20 dark:peer-checked:text-brand-300">
                    {spec}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium text-foreground/80"
            >
              Dirección / Zona
            </label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Ej: Palermo, Buenos Aires"
              className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
            />
            <p className="mt-1.5 text-xs text-foreground/40">
              La ubicación exacta con mapa se configurará más adelante.
            </p>
          </div>

          {/* Hidden lat/lng for future use */}
          <input type="hidden" name="latitude" value="" />
          <input type="hidden" name="longitude" value="" />

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Guardando..." : "Completar Perfil"}
          </button>
        </form>
      </div>
    </section>
  );
}
