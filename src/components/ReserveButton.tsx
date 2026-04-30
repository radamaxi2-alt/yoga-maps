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
  const router = useRouter();

  const handleReserve = () => {
    setErrorMsg("");
    startTransition(async () => {
      const result = await reserveClass(classId);
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
      <div className="flex items-center gap-1.5 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 shadow-sm ring-1 ring-inset ring-green-600/20">
        <span>✅</span> Lugar Reservado
      </div>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className="cursor-not-allowed rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 opacity-70"
      >
        Agotado
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleReserve}
        disabled={isPending}
        className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? "Reservando..." : "Reservar Lugar"}
      </button>
      {errorMsg && <span className="text-[10px] text-red-500">{errorMsg}</span>}
    </div>
  );
}
