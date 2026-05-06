"use client";

interface PageHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  badge?: string;
}

export default function PageHero({ title, subtitle, backgroundImage, badge }: PageHeroProps) {
  return (
    <section className="relative h-[40vh] min-h-[300px] flex items-center overflow-hidden mb-12">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt={title} 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dark/90 via-surface-dark/60 to-background" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {badge && (
            <span className="mb-4 inline-block rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-300 backdrop-blur-xl">
              {badge}
            </span>
          )}
          <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl drop-shadow-2xl font-serif">
            {title}
          </h1>
          <p className="mt-4 text-lg text-white/70 font-medium max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
