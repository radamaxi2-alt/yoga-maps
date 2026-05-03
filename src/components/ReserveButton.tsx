"use client";

import { useState, useTransition, useEffect } from "react";
import { reserveClass } from "@/lib/actions/reservations";
import { useRouter } from "next/navigation";

export default function ReserveButton({
  classId,
  isFull,
  userHasReserved = false,
  currentPresential = 0,
  currentOnline = 0,
  maxPresential = 15,
  maxOnline = 5,
}: {
  classId: string;
  isFull: boolean | null;
  userHasReserved?: boolean;
  currentPresential?: number;
  currentOnline?: number;
  maxPresential?: number;
  maxOnline?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [modality, setModality] = useState<'presential' | 'online'>('presential');
  const router = useRouter();

  const presentialFull = currentPresential >= maxPresential;
  const onlineFull = currentOnline >= maxOnline;
  const allFull = presentialFull && onlineFull;

  // Auto-switch modality if current one is full or disabled (0 capacity)
  useEffect(() => {
    if (maxPresential === 0 && modality !== 'online') {
      setModality('online');
    } else if (maxOnline === 0 && modality !== 'presential') {
      setModality('presential');
    } else if (modality === 'presential' && presentialFull && !onlineFull && maxOnline > 0) {
      setModality('online');
    } else if (modality === 'online' && onlineFull && !presentialFull && maxPresential > 0) {
      setModality('presential');
    }
  }, [presentialFull, onlineFull, modality, maxPresential, maxOnline]);

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

  if (isFull || allFull) {
    return (
      <button disabled className="cursor-not-allowed rounded-full bg-white/5 px-6 py-2.5 text-xs font-bold text-white/30 uppercase tracking-widest">
        AGOTADO
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3">
      {/* Modality Selector */}
      {maxPresential > 0 && maxOnline > 0 && (
        <div className="flex gap-1 p-1 bg-surface-dark/50 rounded-full border border-white/5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => !presentialFull && setModality('presential')}
            disabled={presentialFull}
            className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${modality === 'presential' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white/60'} ${presentialFull ? 'opacity-20 cursor-not-allowed' : ''}`}
          >
            {presentialFull ? 'SALA LLENA' : 'SALA'}
          </button>
          <button
            type="button"
            onClick={() => !onlineFull && setModality('online')}
            disabled={onlineFull}
            className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${modality === 'online' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white/60'} ${onlineFull ? 'opacity-20 cursor-not-allowed' : ''}`}
          >
            {onlineFull ? 'ZOOM LLENO' : 'ZOOM'}
          </button>
        </div>
      )}

      <button
        onClick={handleReserve}
        disabled={isPending || (modality === 'presential' ? presentialFull : onlineFull)}
        className="w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-xs font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/40 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
      >
        {isPending ? "PROCESANDO..." : `RESERVAR ${modality === 'presential' ? 'SALA' : 'ZOOM'}`}
      </button>
      {errorMsg && <span className="text-[10px] font-bold text-red-400 animate-pulse">{errorMsg}</span>}
    </div>
  );
}
