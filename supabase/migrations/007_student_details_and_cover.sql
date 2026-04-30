-- ============================================================
-- Yoga Maps — Fase 9: Detalles de Alumno, Portada y Likes
-- Migración 007
-- ============================================================

-- 1. Añadir Foto de Portada a Profesores
ALTER TABLE public.teacher_details ADD COLUMN cover_image text;

-- 2. Crear Detalles de Estudiante (Bio e Información de Salud Privada)
CREATE TABLE IF NOT EXISTS public.student_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    health_info TEXT
);

-- RLS para student_details
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

-- El propio estudiante puede ver sus detalles
CREATE POLICY "Students can view their own details"
    ON public.student_details FOR SELECT
    USING (auth.uid() = id);

-- Los profesores pueden ver la información de los estudiantes que reservaron sus clases
CREATE POLICY "Teachers can view details of their students"
    ON public.student_details FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_reservations res
            JOIN public.classes c ON c.id = res.class_id
            WHERE res.student_id = student_details.id
            AND c.teacher_id = auth.uid()
            AND res.status = 'confirmed'
        )
    );

-- El propio estudiante puede actualizar sus detalles
CREATE POLICY "Students can update their own details"
    ON public.student_details FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Students can insert their own details"
    ON public.student_details FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. Trigger para crear student_details automáticamente cuando el rol sea 'alumno'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    (new.raw_user_meta_data->>'role')::public.user_role
  );
  
  IF new.raw_user_meta_data->>'role' = 'profesor' THEN
    INSERT INTO public.teacher_details (id)
    VALUES (new.id);
  ELSIF new.raw_user_meta_data->>'role' = 'alumno' THEN
    INSERT INTO public.student_details (id)
    VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Sistema de Likes para el Blog
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver los likes
CREATE POLICY "Anyone can view likes"
    ON public.post_likes FOR SELECT
    USING (true);

-- Usuarios autenticados pueden dar like
CREATE POLICY "Users can insert likes"
    ON public.post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuarios autenticados pueden quitar su like
CREATE POLICY "Users can delete their likes"
    ON public.post_likes FOR DELETE
    USING (auth.uid() = user_id);
