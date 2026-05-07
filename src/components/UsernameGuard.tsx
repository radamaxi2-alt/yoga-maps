"use client";

import React, { useState, useEffect } from "react";
import { updateUsername, checkUsernameAvailability } from "@/lib/actions/profile";
import { Loader2, Check, X } from "lucide-react";

interface UsernameGuardProps {
  user: any;
  profile: any;
}

export default function UsernameGuard({ user, profile }: UsernameGuardProps) {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Solo mostrar si el usuario está logueado y no tiene username
    if (user && !profile?.username) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user, profile]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const clean = username.trim().toLowerCase();
      if (clean.length >= 3) {
        setIsValidating(true);
        const res = await checkUsernameAvailability(clean);
        setIsAvailable(res.available);
        setIsValidating(false);
      } else {
        setIsAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3) return;

    setIsPending(true);
    setError(null);
    
    const res = await updateUsername(username);
    
    if (res.error) {
      setError(res.error);
      setIsPending(false);
    } else {
      // Éxito: El modal se cerrará automáticamente al actualizarse el perfil vía revalidatePath
      setShowModal(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-[2.5rem] glass p-10 border border-brand-500/30 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/20 text-4xl shadow-inner">🆔</div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic mb-4">¡Tu Identidad Yogi!</h2>
          <p className="text-brand-100/60 font-medium">
            Para interactuar con la comunidad y ser etiquetado, necesitas crear tu <span className="text-brand-400">@username</span> único.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-brand-400">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
              placeholder="tu_usuario"
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-10 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-bold"
              disabled={isPending}
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isValidating ? (
                <Loader2 className="animate-spin text-brand-400" size={18} />
              ) : isAvailable === true ? (
                <Check className="text-emerald-400" size={18} />
              ) : isAvailable === false ? (
                <X className="text-red-400" size={18} />
              ) : null}
            </div>
          </div>

          {error && (
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || isAvailable === false || username.length < 3}
            className="w-full rounded-full bg-brand-500 py-4 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-brand-500/40 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} /> GUARDANDO...
              </>
            ) : (
              "CONFIRMAR MI IDENTIDAD"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
