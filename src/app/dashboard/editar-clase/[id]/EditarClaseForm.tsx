"use client";

import { useActionState } from "react";
import { updateClass, type ClassState } from "@/lib/actions/classes";
import type { YogaClass } from "@/lib/database.types";

function toDatetimeLocalValue(isoString: string): string {
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function EditarClaseForm({
  yogaClass,
}: {
  yogaClass: YogaClass;
}) {
  const [state, formAction, pending] = useActionState<ClassState, FormData>(
    updateClass,
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="class_id" value={yogaClass.id} />

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Título de la clase *
        </label>
        <input
          type="text" id="title" name="title" required
          defaultValue={yogaClass.title}
          className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Descripción
        </label>
        <textarea
          id="description" name="description" rows={3}
          defaultValue={yogaClass.description || ""}
          className="w-full resize-none rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scheduled_at" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Fecha y hora *
          </label>
          <input
            type="datetime-local" id="scheduled_at" name="scheduled_at" required
            defaultValue={toDatetimeLocalValue(yogaClass.scheduled_at)}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-foreground/80">
            Precio (ARS)
          </label>
          <input
            type="number" id="price" name="price" min="0" step="0.01"
            defaultValue={yogaClass.price}
            className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="jitsi_room_link" className="mb-1.5 block text-sm font-medium text-foreground/80">
          Link de sala Jitsi (opcional)
        </label>
        <input
          type="url" id="jitsi_room_link" name="jitsi_room_link"
          defaultValue={yogaClass.jitsi_room_link || ""}
          placeholder="https://meet.jit.si/mi-clase-yoga"
          className="w-full rounded-xl border border-brand-200/60 bg-surface-alt/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-dark-alt dark:bg-surface-dark/50"
        />
      </div>

      <button
        type="submit" disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
