"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoggingOut(false);
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (newUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", newUser.id)
          .single();
        setIsProfesor(profile?.role === "profesor" || profile?.role === "escuela");
      } else {
        setIsProfesor(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
      router.refresh();
    } finally {
      // Small timeout to allow redirect before resetting button text
      setTimeout(() => setLoggingOut(false), 2000);
    }
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
            <div className="hidden items-center gap-4 sm:flex border-l border-brand-100 pl-4 ml-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-tight">Sesión activa</span>
                <span className="text-sm font-bold text-foreground leading-none">
                  {displayName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full bg-surface-dark-alt px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-600 disabled:opacity-50 shadow-md"
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
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[72px] z-50 border-t border-white/5 bg-surface-dark/95 backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-1 px-6 py-10 max-h-[80vh] overflow-y-auto">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-4 py-4 text-lg font-bold text-white/90 hover:bg-white/5 hover:text-brand-400 transition-all border border-transparent hover:border-white/5"
              >
                {label}
              </Link>
            ))}
            {!user ? (
              <div className="mt-8 px-4">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-2xl bg-brand-600 py-4 text-center text-lg font-black text-white shadow-xl shadow-brand-500/20"
                >
                  ACCEDER
                </Link>
              </div>
            ) : (
              <div className="mt-10 border-t border-white/5 pt-10">
                <div className="flex items-center gap-4 px-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-brand-500/20 flex items-center justify-center text-2xl border border-brand-500/30">👤</div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Sesión de {isProfesor ? 'Instructor' : 'Alumno'}</p>
                    <p className="text-lg font-black text-white">{displayName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 px-4 py-5 text-base font-bold text-white hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
                >
                  <span>🚪</span> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
