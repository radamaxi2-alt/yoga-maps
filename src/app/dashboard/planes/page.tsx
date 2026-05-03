import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PlanesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, full_name")
    .eq("id", user.id)
    .single();

  const ALIAS = "minado.runfla.lemon";
  const WHATSAPP = "542231234567";

  const plans = [
    {
      id: "zen",
      name: "Plan Zen",
      price: "$15,000",
      description: "Ideal para independientes.",
      features: [
        "Hasta 12 clases por mes (3/semana)",
        "Gestión híbrida (Presencial/Online)",
        "Presencia en el Mapa",
        "Ficha Médica de alumnos",
        "0% Comisión por clase"
      ],
      color: "from-brand-600/20 to-brand-400/5",
      accent: "text-brand-400",
      border: "border-brand-500/20"
    },
    {
      id: "namaste",
      name: "Plan Namasté / Pro",
      price: "$50,000",
      description: "Para profesionales.",
      features: [
        "Hasta 80 clases por mes (20/semana)",
        "Hasta 2 Eventos/Retiros mensuales",
        "Visibilidad Prioritaria",
        "Soporte Premium",
        "0% Comisión por clase"
      ],
      color: "from-cyan-600/20 to-cyan-400/5",
      accent: "text-cyan-400",
      border: "border-cyan-500/20",
      popular: true
    },
    {
      id: "escuela",
      name: "Plan Escuela",
      price: "$100,000",
      description: "Solución total.",
      features: [
        "Clases Ilimitadas",
        "Eventos/Retiros Ilimitados",
        "Gestión de múltiples profesores",
        "Perfil de Institución verificado",
        "0% Comisión por clase"
      ],
      color: "from-purple-600/20 to-purple-400/5",
      accent: "text-purple-400",
      border: "border-purple-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-surface-dark pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors mb-8">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white italic tracking-tighter sm:text-6xl uppercase">
            Escala tu Propósito
          </h1>
          <p className="mt-4 text-lg text-brand-100/60 font-medium">
            Elegí el plan que mejor se adapte a tu ritmo de enseñanza.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col rounded-[3rem] border ${plan.border} bg-gradient-to-br ${plan.color} p-8 backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-2xl ${plan.popular ? 'ring-2 ring-cyan-500/50 shadow-cyan-500/10' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-[10px] font-black uppercase text-white shadow-lg">
                  MÁS ELEGIDO
                </span>
              )}
              
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white tracking-tighter">{plan.price}</span>
                  <span className="text-xs font-bold text-white/30 uppercase">/ mes</span>
                </div>
                <p className="mt-4 text-sm font-medium text-brand-100/60">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={feature} className="flex items-center gap-3 text-xs font-bold text-white/80">
                    <span className={plan.accent}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a 
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola! Quiero activar el ${plan.name} para ${profile.full_name}. ¿Cómo procedo?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-10 block w-full rounded-full py-4 text-center text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${plan.popular ? 'bg-cyan-500 text-white shadow-cyan-500/20' : 'bg-white text-brand-900 shadow-brand-500/10'}`}
              >
                Activar Plan
              </a>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-24 overflow-hidden rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="p-10 text-center border-b border-white/5">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Comparativa de Beneficios</h2>
            <p className="mt-2 text-sm text-brand-100/40">Yoga Maps es tu socio tecnológico. Sin letras chicas.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-brand-400">
                <tr>
                  <th className="px-10 py-6">Beneficio</th>
                  <th className="px-10 py-6 text-center">Zen</th>
                  <th className="px-10 py-6 text-center">Namasté</th>
                  <th className="px-10 py-6 text-center">Escuela</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-bold text-white/70">
                <tr>
                  <td className="px-10 py-6">Comisión por reserva</td>
                  <td className="px-10 py-6 text-center text-cyan-400 font-black">0%</td>
                  <td className="px-10 py-6 text-center text-cyan-400 font-black">0%</td>
                  <td className="px-10 py-6 text-center text-cyan-400 font-black">0%</td>
                </tr>
                <tr>
                  <td className="px-10 py-6">Visibilidad en Mapa</td>
                  <td className="px-10 py-6 text-center">Estándar</td>
                  <td className="px-10 py-6 text-center text-cyan-400">Prioritaria</td>
                  <td className="px-10 py-6 text-center text-purple-400">Máxima</td>
                </tr>
                <tr>
                  <td className="px-10 py-6">Ficha Médica Digital</td>
                  <td className="px-10 py-6 text-center">✓</td>
                  <td className="px-10 py-6 text-center">✓</td>
                  <td className="px-10 py-6 text-center">✓</td>
                </tr>
                <tr>
                  <td className="px-10 py-6">Gestión Híbrida</td>
                  <td className="px-10 py-6 text-center">✓</td>
                  <td className="px-10 py-6 text-center">✓</td>
                  <td className="px-10 py-6 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-10 bg-brand-500/5 text-center">
            <p className="text-xs text-brand-100/60 leading-relaxed max-w-2xl mx-auto italic">
              "En Yoga Maps creemos que tu esfuerzo debe ser para vos. No cobramos comisiones porque somos una herramienta de gestión (SaaS). Vos mantenés el 100% de lo que cobrás a tus alumnos."
            </p>
          </div>
        </div>

        {/* Payment Modal/Info */}
        <div className="mt-20 rounded-[3rem] bg-gradient-to-r from-brand-600 to-brand-500 p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">¿Cómo activar tu cuenta?</h2>
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-lg font-medium opacity-80">Transferí el monto del plan a nuestro alias:</p>
            <div className="rounded-2xl bg-white/10 px-8 py-4 border border-white/20">
              <span className="text-3xl font-black tracking-tight select-all">{ALIAS}</span>
            </div>
            <p className="mt-4 text-sm opacity-60">Una vez realizada la transferencia, hacé clic en el botón de abajo para enviarnos el comprobante.</p>
            <a 
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola! Acabo de transferir para activar mi cuenta. Mi usuario es ${profile.full_name}. Adjunto el comprobante.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-xs font-black uppercase tracking-widest text-brand-900 shadow-2xl hover:scale-105 transition-all"
            >
              <span>💬</span> ENVIAR COMPROBANTE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
