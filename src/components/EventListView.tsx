"use client";

import Link from "next/link";
import { reserveClass } from "@/lib/actions/reservations";
import { useTransition } from "react";

type Event = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  scheduled_at: string;
  category: string | null;
  image_url?: string | null;
  instructor_name: string | null;
  teacher_id: string;
};

export default function EventListView({
  events,
  title,
  subtitle,
}: {
  events: Event[];
  title: string;
  subtitle: string;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleReserve(eventId: string) {
    if (!confirm("¿Deseas reservar tu lugar? Se enviará un mail al profesor con tu ficha médica.")) return;
    
    startTransition(async () => {
      const result = await reserveClass(eventId);
      if (result.error) {
        alert(result.error);
      } else {
        alert("¡Reserva confirmada! El profesor ha sido notificado.");
      }
    });
  }

  return (
    <section className="min-h-screen bg-surface-dark-alt px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-brand-200/60 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-12 lg:grid-cols-2">
            {events.map((event) => (
              <div 
                key={event.id}
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-surface-dark/40 border border-white/5 backdrop-blur-xl transition-all hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/10"
              >
                {/* Image Placeholder/Background */}
                <div className="relative h-72 w-full overflow-hidden bg-brand-900/20">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl opacity-20">🧘‍♀️</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dark-alt via-transparent to-transparent opacity-60" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-6 left-6 rounded-full bg-brand-500 px-4 py-1 text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
                    {event.category || "Evento"}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-8 sm:p-10">
                  <div className="mb-4 flex items-center justify-between text-xs font-bold text-brand-300 uppercase tracking-wider">
                    <span>{new Date(event.scheduled_at).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' })}</span>
                    <span>{event.price > 0 ? `$${event.price}` : 'Gratis'}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-400 transition-colors">
                    {event.title}
                  </h2>

                  <p className="text-brand-100/60 line-clamp-3 text-sm leading-relaxed mb-8 flex-1">
                    {event.description || "Un evento único para profundizar en tu práctica de yoga y bienestar."}
                  </p>

                  <div className="mt-auto flex flex-col sm:flex-row items-center gap-6 border-t border-white/5 pt-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                        {event.instructor_name?.[0] || "P"}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white uppercase">{event.instructor_name || "Profesor"}</p>
                        <Link href={`/profesores/${event.teacher_id}`} className="text-[10px] text-brand-400 hover:underline">Ver perfil</Link>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReserve(event.id)}
                      disabled={isPending}
                      className="w-full sm:w-auto rounded-full bg-white px-8 py-3 text-xs font-bold text-surface-dark transition-all hover:bg-brand-400 hover:text-white disabled:opacity-50"
                    >
                      {isPending ? "Procesando..." : "Reservar Lugar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[3rem] border border-white/5 bg-surface-dark/20 py-32 text-center">
            <p className="text-xl font-medium text-brand-100/40">
              Aún no hay publicaciones en esta categoría. <br/>
              <span className="text-sm">¡Vuelve pronto!</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
