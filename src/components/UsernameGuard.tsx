"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UsernameGuardProps {
  user: any;
  profile: any;
}

export default function UsernameGuard({ user, profile }: UsernameGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && !profile?.username && pathname !== "/perfil/editar" && pathname !== "/onboarding") {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user, profile, pathname]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-[2.5rem] glass p-10 border border-brand-500/30 shadow-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/20 text-4xl shadow-inner">🆔</div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic mb-4">¡Tu Identidad Yogi!</h2>
        <p className="text-brand-100/60 font-medium mb-8">
          Para interactuar con la comunidad y ser etiquetado en retiros, necesitas crear tu <span className="text-brand-400">@username</span> único.
        </p>
        <button
          onClick={() => router.push("/perfil/editar")}
          className="w-full rounded-full bg-brand-500 py-4 text-xs font-black text-white uppercase tracking-widest shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-brand-500/40"
        >
          Crear mi usuario ahora
        </button>
      </div>
    </div>
  );
}
