"use client";

import { useState, useTransition, useEffect } from "react";
import { reserveClass } from "@/lib/actions/reservations";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

export default function ReserveButton({
  classId,
  classTitle,
  scheduledAt,
  isFull,
  userHasReserved = false,
  currentPresential = 0,
  currentOnline = 0,
  maxPresential = 15,
  maxOnline = 5,
  teacherWhatsapp = "542231234567",
}: {
  classId: string;
  classTitle?: string;
  scheduledAt?: string;
  isFull: boolean | null;
  userHasReserved?: boolean;
  currentPresential?: number;
  currentOnline?: number;
  maxPresential?: number;
  maxOnline?: number;
  teacherWhatsapp?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [requiresRenewal, setRequiresRenewal] = useState(false);
  const [modality, setModality] = useState<'presential' | 'online'>('presential');
  const [showCalendarLink, setShowCalendarLink] = useState(false);
  const router = useRouter();

  const presentialFull = currentPresential >= maxPresential;
  const onlineFull = currentOnline >= maxOnline;
  const allFull = presentialFull && onlineFull;

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
        } else if ((result as any).requiresRenewal) {
          setRequiresRenewal(true);
          setErrorMsg(result.error);
        } else {
          setErrorMsg(result.error);
        }
      } else if (result?.whatsappUrl) {
        setShowCalendarLink(true);
        window.open(result.whatsappUrl, "_blank");
      }
    });
  };

  const getGoogleCalendarUrl = () => {
    if (!scheduledAt || !classTitle) return "#";
    const startDate = new Date(scheduledAt);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour class
    
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");
    
    const url = new URL("https://www.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", `🧘 Clase de Yoga: ${classTitle}`);
    url.searchParams.append("dates", `${formatDate(startDate)}/${formatDate(endDate)}`);
    url.searchParams.append("details", "Reserva realizada a través de Yoga Maps. ¡No olvides tu mat!");
    url.searchParams.append("location", "Yoga Maps App");
    // Google doesn't have a direct "8 hours before" param in the URL that works reliably across all clients, 
    // but the default user settings usually take over.
    return url.toString();
  };

  if (userHasReserved || showCalendarLink) {
    return (
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-6 py-2.5 text-xs font-bold text-brand-400 ring-1 ring-brand-500/30">
          <span>⏳</span> PENDIENTE DE PAGO
        </div>
        
        <a
          href={getGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          <Calendar size={14} className="text-brand-400" />
          Agendar en Google Calendar
        </a>
        
        {!showCalendarLink && (
          <p className="text-[9px] font-medium text-white/30 uppercase tracking-tighter">Confirmá tu cupo por WhatsApp</p>
        )}
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
            {onlineFull ? 'ONLINE LLENO' : 'ONLINE'}
          </button>
        </div>
      )}


      {requiresRenewal ? (
        <a 
          href={`https://wa.me/${teacherWhatsapp}?text=${encodeURIComponent(`¡Hola! Quisiera renovar mi abono para la clase de ${classTitle}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-full bg-amber-500 px-6 py-2.5 text-xs font-black text-brand-900 shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:shadow-amber-500/40 text-center uppercase tracking-widest"
        >
          Sin clases disponibles. Contacta al profesor para renovar
        </a>
      ) : (
        <button
          onClick={handleReserve}
          disabled={isPending || (modality === 'presential' ? presentialFull : onlineFull)}
          className="w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-2.5 text-xs font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/40 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
        >
          {isPending ? "PROCESANDO..." : `RESERVAR ${modality === 'presential' ? 'SALA' : 'ONLINE'}`}
        </button>
      )}
      {errorMsg && <span className="text-[10px] font-bold text-red-400 animate-pulse">{errorMsg}</span>}
    </div>
  );
}
