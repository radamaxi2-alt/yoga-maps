-- Agregar precio promedio a teacher_details
ALTER TABLE public.teacher_details
  ADD COLUMN IF NOT EXISTS average_price NUMERIC(10, 2) DEFAULT 0;
