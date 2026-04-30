-- ============================================================
-- Yoga Maps — Fase 2: Modelado de Base de Datos
-- Migración 001: Esquema inicial + RLS
-- ============================================================

-- -------------------------------------------------------
-- 1. Tipo ENUM para roles de usuario
-- -------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('profesor', 'alumno');

-- -------------------------------------------------------
-- 2. Tabla: profiles
-- Vinculada 1:1 con auth.users
-- -------------------------------------------------------
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.user_role DEFAULT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfiles públicos de usuarios, vinculados a auth.users.';

-- -------------------------------------------------------
-- 3. Tabla: teacher_details
-- Datos específicos para usuarios con role = 'profesor'
-- -------------------------------------------------------
CREATE TABLE public.teacher_details (
  id          UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio         TEXT,
  specialties TEXT[],         -- Array de especialidades (ej: {'Hatha','Vinyasa','Kundalini'})
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.teacher_details IS 'Información extendida de profesores: bio, ubicación, especialidades.';

-- -------------------------------------------------------
-- 4. Tabla: classes
-- Agenda de clases publicadas por profesores
-- -------------------------------------------------------
CREATE TABLE public.classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID NOT NULL REFERENCES public.teacher_details(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  jitsi_room_link TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.classes IS 'Clases programadas por profesores, con precio y link de streaming.';

-- Índice para consultas por profesor y por fecha
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_classes_scheduled_at ON public.classes(scheduled_at);

-- -------------------------------------------------------
-- 5. Trigger: actualizar updated_at automáticamente
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_teacher_details
  BEFORE UPDATE ON public.teacher_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_classes
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------
-- 6. Trigger: crear perfil automáticamente al registrarse
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ---- profiles ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Perfiles: lectura pública"
  ON public.profiles FOR SELECT
  USING (true);

-- Solo el propio usuario puede actualizar su perfil
CREATE POLICY "Perfiles: actualización propia"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- teacher_details ----
ALTER TABLE public.teacher_details ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Profesores: lectura pública"
  ON public.teacher_details FOR SELECT
  USING (true);

-- Solo el propio profesor puede insertar sus datos
CREATE POLICY "Profesores: inserción propia"
  ON public.teacher_details FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Solo el propio profesor puede actualizar sus datos
CREATE POLICY "Profesores: actualización propia"
  ON public.teacher_details FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- classes ----
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Clases: lectura pública"
  ON public.classes FOR SELECT
  USING (true);

-- Solo el profesor dueño puede insertar clases
CREATE POLICY "Clases: inserción por profesor"
  ON public.classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Solo el profesor dueño puede actualizar sus clases
CREATE POLICY "Clases: actualización por profesor"
  ON public.classes FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Solo el profesor dueño puede eliminar sus clases
CREATE POLICY "Clases: eliminación por profesor"
  ON public.classes FOR DELETE
  USING (auth.uid() = teacher_id);
