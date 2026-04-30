-- ============================================================
-- Yoga Maps — Fase 8: Sistema de Reservas
-- Migración 006
-- ============================================================

CREATE TABLE IF NOT EXISTS public.class_reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, student_id) -- Un alumno no puede reservar dos veces la misma clase
);

-- Habilitar RLS
ALTER TABLE public.class_reservations ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (RLS)
-- Los usuarios pueden ver sus propias reservas
CREATE POLICY "Users can view their own reservations"
    ON public.class_reservations FOR SELECT
    USING (auth.uid() = student_id);

-- Los profesores pueden ver las reservas de sus clases
CREATE POLICY "Teachers can view reservations for their classes"
    ON public.class_reservations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE classes.id = class_reservations.class_id
            AND classes.teacher_id = auth.uid()
        )
    );

-- Los usuarios autenticados pueden crear reservas (para ellos mismos)
CREATE POLICY "Users can create their own reservations"
    ON public.class_reservations FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Los usuarios pueden cancelar (actualizar) sus propias reservas
CREATE POLICY "Users can update their own reservations"
    ON public.class_reservations FOR UPDATE
    USING (auth.uid() = student_id);
