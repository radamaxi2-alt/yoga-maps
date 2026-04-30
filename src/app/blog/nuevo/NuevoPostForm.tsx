"use client";

import { useActionState, useState } from "react";
import { createPost, type BlogState } from "@/lib/actions/blog";
import Link from "next/link";

export default function NuevoPostForm() {
  const [state, formAction, pending] = useActionState<BlogState, FormData>(
    createPost,
    {}
  );
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

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
        <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Imagen de portada
        </label>
        <div className="mt-1 flex flex-col items-center gap-4">
          {preview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-brand-100 shadow-sm">
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-surface/50 px-4 py-8 text-sm text-foreground/60 transition-colors hover:border-brand-400 hover:bg-brand-50/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{preview ? "Cambiar imagen" : "Subir desde mi galería"}</span>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
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
