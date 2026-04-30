"use client";

import { useState } from "react";

export default function LiveClassButton({ jitsiLink }: { jitsiLink: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="animate-pulse-glow inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
        </span>
        Clase en Vivo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-dark/80 p-4 backdrop-blur-sm sm:p-6">
          <div className="glass relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-surface-dark shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-200/20 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🪷</span>
                <h3 className="font-sans text-lg font-semibold text-white">Sala de Yoga</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Iframe */}
            <div className="flex-1 bg-black">
              <iframe
                src={jitsiLink}
                allow="camera; microphone; fullscreen; display-capture"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
