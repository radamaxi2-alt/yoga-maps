"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface QuickActionsProps {
  userId: string;
  isSchool: boolean;
}

export default function QuickActions({ userId, isSchool }: QuickActionsProps) {
  const copyProfileLink = () => {
    const url = `${window.location.origin}/profesores/${userId}`;
    navigator.clipboard.writeText(url);
    alert("¡Link copiado al portapapeles! Compartilo con tus alumnos.");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      <h2 className="text-2xl font-black text-[#51345f] tracking-tight italic uppercase">Gestión de Clases</h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={copyProfileLink}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-6 py-3.5 text-[10px] font-black text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
        >
          🔗 INVITAR ALUMNOS
        </button>
        {!isSchool && (
          <Link
            href="/dashboard/nueva-clase"
            className="inline-flex items-center gap-2 rounded-full bg-[#a95ec4] px-8 py-3.5 text-xs font-black text-white shadow-xl shadow-[#9f5db8]/20 transition-all hover:-translate-y-0.5 hover:bg-[#9950b4] hover:shadow-[#9f5db8]/30"
          >
            <Plus size={14} /> NUEVA CLASE
          </Link>
        )}
      </div>
    </div>
  );
}
