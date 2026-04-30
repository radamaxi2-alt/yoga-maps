"use client";

import { useActionState } from "react";
import { createPost, type BlogState } from "@/lib/actions/blog";
import Link from "next/link";

export default function NuevoPostForm() {
  const [state, formAction, pending] = useActionState<BlogState, FormData>(
    createPost,
    {}
  );

  return (
    <form action={formAction} className="space-y-6 font-sans">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Título del artículo
        </label>
        <input
          type="text" id="title" name="title" required
          placeholder="Ej: Los beneficios del Vinyasa Yoga..."
          className="w-full rounded-2xl border border-brand-200/60 bg-surface/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        />
      </div>

      <div>
        <label htmlFor="image_url" className="mb-1.5 block text-sm font-medium text-foreground/80">
          URL de imagen (opcional)
        </label>
        <input
          type="url" id="image_url" name="image_url"
          placeholder="https://images.unsplash.com/..."
          className="w-full rounded-2xl border border-brand-200/60 bg-surface/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Contenido
        </label>
        <textarea
          id="content" name="content" required rows={10}
          placeholder="Escribe tu artículo aquí..."
          className="w-full resize-y rounded-2xl border border-brand-200/60 bg-surface/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
        />
      </div>

      <button
        type="submit" disabled={pending}
        className="w-full rounded-full bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:bg-brand-500 disabled:opacity-50"
      >
        {pending ? "Publicando..." : "Publicar Artículo"}
      </button>
    </form>
  );
}
