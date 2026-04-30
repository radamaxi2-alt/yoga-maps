-- ============================================================
-- Yoga Maps — Fase 7: Perfiles de Escuela, Estilos y Aforo
-- Migración 005
-- ============================================================

-- 1. Agregar tipo de perfil a teacher_details
ALTER TABLE public.teacher_details ADD COLUMN teacher_type text DEFAULT 'independiente';

-- 2. Modificaciones a classes
ALTER TABLE public.classes ADD COLUMN style text;
ALTER TABLE public.classes ADD COLUMN instructor_name text;
ALTER TABLE public.classes ADD COLUMN max_capacity integer;
ALTER TABLE public.classes ADD COLUMN is_full boolean DEFAULT false;
ALTER TABLE public.classes ADD COLUMN latitude double precision;
ALTER TABLE public.classes ADD COLUMN longitude double precision;
ALTER TABLE public.classes ADD COLUMN address text;
