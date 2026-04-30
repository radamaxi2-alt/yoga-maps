import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Explorar",
    links: [
      { href: "/profesores", label: "Profesores" },
      { href: "/clases", label: "Clases" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: "/login", label: "Iniciar Sesión" },
      { href: "/registro", label: "Registrarse" },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-brand-200/30 bg-gradient-to-b from-surface-alt to-white dark:from-surface-dark dark:to-surface-dark-alt">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 outline-none"
            >
              <img src="/logo.png" alt="Yoga Maps Logo" className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/60 font-sans">
              Conecta con tu práctica. Encuentra clases,
              retiros y sesiones de armonización cerca de ti.
            </p>
          </div>

          {/* Link Columns */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground/40">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/60 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-brand-200/20 pt-6 dark:border-surface-dark-alt sm:flex-row">
          <p className="text-xs text-foreground/40">
            © {currentYear} Yoga Maps. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-foreground/30">
              Hecho con 🧘 y ❤️
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
