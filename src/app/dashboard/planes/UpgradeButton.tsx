"use client";

import { useTransition } from "react";
import { activatePlanForDemo } from "@/lib/actions/profile";

export default function UpgradeButton({ planId, currentPlan }: { planId: string, currentPlan: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    if (confirm(`¿Quieres activar el ${planId.toUpperCase()} para pruebas?`)) {
      startTransition(async () => {
        await activatePlanForDemo(planId);
      });
    }
  };

  if (currentPlan === planId) {
    return (
      <div className="mt-10 block w-full rounded-full bg-brand-500/20 py-4 text-center text-xs font-black uppercase tracking-widest text-brand-400 border border-brand-500/30 italic">
        Plan Actual
      </div>
    );
  }

  return (
    <button 
      onClick={handleUpgrade}
      disabled={isPending}
      className={`mt-10 block w-full rounded-full py-4 text-center text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${planId === 'namaste' ? 'bg-cyan-500 text-white shadow-cyan-500/20' : 'bg-white text-brand-900 shadow-brand-500/10'}`}
    >
      {isPending ? "Activando..." : "Activar Ahora (Demo)"}
    </button>
  );
}
