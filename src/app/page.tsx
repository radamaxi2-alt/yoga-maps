import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <span className="animate-fade-in mb-4 inline-block rounded-full border border-brand-200/50 bg-brand-50/80 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-brand-700 backdrop-blur-sm">
              🪷 Tu refugio de bienestar
            </span>
            <h1 className="animate-fade-in mt-4 font-serif text-5xl font-bold leading-tight text-foreground sm:text-6xl lg:text-7xl">
              Práctica espiritual y{" "}
              <span className="text-brand-600">
                energía vital
              </span>
            </h1>
            <p className="animate-fade-in mx-auto mt-6 max-w-xl text-lg leading-relaxed text-foreground/70 font-sans">
              Conectamos a estudiantes con los mejores profesores de yoga.
              Explora clases presenciales, online y retiros de armonización.
            </p>
            <div className="animate-fade-in mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row font-sans">
              <Link
                href="/profesores"
                className="inline-flex items-center rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/30 hover:bg-brand-500"
              >
                Directorio de Profesores
              </Link>
              <Link
                href="/clases"
                className="glass inline-flex items-center rounded-full px-8 py-3.5 text-sm font-semibold text-brand-700 transition-all duration-200 hover:-translate-y-1 hover:bg-brand-50"
              >
                Ver Agenda de Clases
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center text-brand-500 text-3xl mb-4">🕉️</div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Todo lo que necesitas para tu práctica
            </h2>
            <p className="mt-4 text-foreground/60 text-lg">
              Una plataforma diseñada como un santuario digital para la comunidad de yoga.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🗺️",
                title: "Profesores Cerca de Ti",
                description:
                  "Descubre maestros verificados en tu zona con perfiles detallados y reseñas.",
                href: "/profesores",
              },
              {
                icon: "📅",
                title: "Agenda de Clases",
                description:
                  "Consulta horarios, estilos de yoga y reserva tu próxima clase en un clic.",
                href: "/clases",
              },
              {
                icon: "🪷",
                title: "Inspiración & Energía",
                description:
                  "Artículos profundos sobre filosofía del yoga, meditación y bienestar integral.",
                href: "/blog",
              },
            ].map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="glass group rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/15"
              >
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </span>
                <h3 className="mt-6 font-serif text-xl font-bold text-foreground group-hover:text-brand-600">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
