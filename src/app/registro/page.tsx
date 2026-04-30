"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signup, type AuthState } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const ROLE_OPTIONS = [
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

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    {}
  );
  const [selectedRole, setSelectedRole] = useState("alumno");

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${selectedRole}`,
      },
    });
  }

  // Show success message (email confirmation required)
  if (state.success) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-brand-100/50 bg-white/70 p-10 shadow-xl shadow-brand-500/5 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark-alt/70">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl dark:bg-brand-900/30">
              ✉️
            </span>
            <h2 className="mt-6 text-xl font-bold text-foreground">
              ¡Revisá tu correo!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/60">
              {state.message}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-brand-100/50 bg-white/70 p-8 shadow-xl shadow-brand-500/5 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark-alt/70">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl text-white shadow-lg shadow-brand-500/25">
              ✨
            </span>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Crear Cuenta
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Unite a la comunidad de Yoga Maps
            </p>
          </div>

          {/* Error */}
          {state.error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {state.error}
            </div>
          )}

          {/* Role Selector — shown BEFORE sign-up methods so it applies to both */}
          <fieldset className="mb-6">
            <legend className="mb-3 text-sm font-medium text-foreground/80">
              ¿Cuál es tu rol?
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="group relative cursor-pointer"
                >
                  <input
                    type="radio"
                    name="role_display"
                    value={opt.value}
                    checked={selectedRole === opt.value}
                    onChange={() => setSelectedRole(opt.value)}
                    className="peer sr-only"
                  />
                  <div className="rounded-xl border-2 border-brand-100/60 bg-surface-alt/30 p-4 text-center transition-all duration-200 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:shadow-md peer-checked:shadow-brand-500/10 hover:border-brand-200 dark:border-surface-dark-alt dark:bg-surface-dark/30 dark:peer-checked:border-brand-500 dark:peer-checked:bg-brand-900/20">
                    <span className="text-2xl">{opt.emoji}</span>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {opt.label}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-foreground/50">
                      {opt.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-200/60 bg-white px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:border-brand-300 hover:shadow-md dark:border-surface-dark-alt dark:bg-surface-dark/80 dark:hover:border-brand-700"
          >
            <GoogleIcon />
            Registrarse con Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-100/60 dark:bg-surface-dark-alt" />
            <span className="text-xs font-medium text-foreground/40">
              o con email
            </span>
            <div className="h-px flex-1 bg-brand-100/60 dark:bg-surface-dark-alt" />
          </div>

          {/* Email/Password Form */}
          <form action={formAction} className="space-y-4">
            {/* Hidden role field for the server action */}
            <input type="hidden" name="role" value={selectedRole} />

            <div>
              <label
                htmlFor="full_name"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Nombre completo
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground/80"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
