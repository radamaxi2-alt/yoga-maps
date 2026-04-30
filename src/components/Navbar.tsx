"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/profesores", label: "Profesores" },
  { href: "/clases", label: "Clases" },
  { href: "/retiros", label: "Retiros" },
  { href: "/armonizaciones", label: "Armonizaciones" },
  { href: "/formaciones", label: "Formaciones" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar({
  initialUser = null,
  initialIsProfesor = false,
}: {
  initialUser?: User | null;
  initialIsProfesor?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isProfesor, setIsProfesor] = useState(initialIsProfesor);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      if (newUser?.id !== user?.id) {
        setUser(newUser);
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-[100] w-full glass border-b-0 font-sans">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80 outline-none"
        >
          <img src="/logo.png" alt="Yoga Maps Logo" className="h-14 w-auto drop-shadow-sm" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-100 text-brand-700 shadow-sm"
                      : "text-foreground/70 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          {user && isProfesor && (
            <li>
              <Link
                href="/dashboard"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith("/dashboard")
                    ? "bg-brand-100 text-brand-700 shadow-sm"
                    : "text-foreground/70 hover:bg-brand-50 hover:text-brand-600"
                }`}
              >
                Mi Panel
              </Link>
            </li>
          )}
          {user && !isProfesor && (
            <li>
              <Link
                href="/student-profile"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith("/student-profile")
                    ? "bg-brand-100 text-brand-700 shadow-sm"
                    : "text-foreground/70 hover:bg-brand-50 hover:text-brand-600"
                }`}
              >
                Mi Perfil
              </Link>
            </li>
          )}
        </ul>

        {/* Auth / CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-sm font-medium text-foreground/70">
                {displayName}
              </span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full border border-brand-200 bg-white/60 px-4 py-2 text-sm font-medium text-brand-700 transition-all hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50"
              >
                {loggingOut ? "Saliendo..." : "Cerrar Sesión"}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:bg-brand-500 sm:inline-flex"
            >
              Acceder
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/70 transition hover:bg-brand-50 dark:hover:bg-surface-dark-alt md:hidden"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="animate-slide-down border-t border-brand-100/50 bg-white/95 backdrop-blur-lg dark:border-surface-dark-alt dark:bg-surface-dark/95 md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                        : "text-foreground/70 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-surface-dark-alt dark:hover:text-brand-400"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            {user && isProfesor && (
              <li>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    pathname.startsWith("/dashboard")
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                      : "text-foreground/70 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-surface-dark-alt dark:hover:text-brand-400"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="mt-2 block w-full rounded-full border border-brand-200 bg-white/60 px-5 py-3 text-center text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50 dark:border-surface-dark-alt dark:bg-surface-dark-alt/60 dark:text-brand-300"
                >
                  Cerrar Sesión ({displayName})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 block rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:brightness-110"
                >
                  Acceder
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
