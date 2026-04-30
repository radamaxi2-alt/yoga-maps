"use client";

import { useState, useTransition } from "react";
import { reserveClass } from "@/lib/actions/reservations";
import { useRouter } from "next/navigation";

export default function ReserveButton({
  classId,
  isFull,
  userHasReserved = false,
}: {
  classId: string;
  isFull: boolean | null;
  userHasReserved?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [modality, setModality] = useState<'presential' | 'online'>('presential');
  const router = useRouter();

  const handleReserve = () => {
    setErrorMsg("");
    startTransition(async () => {
      const result = await reserveClass(classId, modality);
      if (result?.error) {
        if (result.error === "Debes iniciar sesión para reservar una clase.") {
          router.push("/login");
        } else {
          setErrorMsg(result.error);
        }
      }
    });
  };

  if (userHasReserved) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-6 py-2.5 text-xs font-bold text-brand-400 ring-1 ring-brand-500/30">
        <span>✅</span> LUGAR RESERVADO
      </div>
    );
  }

  if (isFull) {
    return (
      <button disabled className="cursor-not-allowed rounded-full bg-white/5 px-6 py-2.5 text-xs font-bold text-white/30 uppercase tracking-widest">
        AGOTADO
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3">
      {/* Modality Selector */}
      <div className="flex gap-1 p-1 bg-surface-dark/50 rounded-full border border-white/5 backdrop-blur-md">
        <button
          onClick={() => setModality('presential')}
          className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${modality === 'presential' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          PRESENCIAL
        </button>
        <button
          onClick={() => setModality('online')}
          className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${modality === 'online' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          ONLINE
        </button>
      </div>

      <button
        onClick={handleReserve}
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-xs font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/40 active:scale-95 disabled:opacity-50"
      >
        {isPending ? "PROCESANDO..." : `RESERVAR ${modality === 'presential' ? 'SALA' : 'ZOOM'}`}
      </button>
      {errorMsg && <span className="text-[10px] font-bold text-red-400 animate-pulse">{errorMsg}</span>}
    </div>
  );
}
