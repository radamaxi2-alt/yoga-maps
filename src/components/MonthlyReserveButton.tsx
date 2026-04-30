"use client";

import { useState, useTransition } from "react";
import { reserveMonthlyPack } from "@/lib/actions/reservations";
import { useRouter } from "next/navigation";

export default function MonthlyReserveButton({
  classId,
  isFull,
  disabled = false,
}: {
  classId: string;
  isFull: boolean | null;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleMonthlyReserve = () => {
    if (confirm("¿Quieres reservar el pase mensual? Esto te inscribirá en todas las clases de este estilo durante los próximos 30 días.")) {
      setErrorMsg("");
      startTransition(async () => {
        const result = await reserveMonthlyPack(classId);
        if (result?.error) {
          if (result.error === "Debes iniciar sesión para reservar.") {
            router.push("/login");
          } else {
            setErrorMsg(result.error);
          }
        } else if (result?.success) {
          alert(`¡Reserva exitosa! Te inscribiste en ${result.count} clases.`);
        }
      });
    }
  };

  if (isFull || disabled) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleMonthlyReserve}
        disabled={isPending}
        className="rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-tight text-brand-600 shadow-sm transition-all hover:bg-brand-50 hover:border-brand-300 disabled:opacity-50"
      >
        {isPending ? "Procesando..." : "📅 Pase Mensual"}
      </button>
      {errorMsg && <span className="text-[9px] text-red-500 font-sans">{errorMsg}</span>}
    </div>
  );
}
