-- 1. Actualizar la función de verificación de límites para ciclos mensuales (30 días)
CREATE OR REPLACE FUNCTION check_class_limit()
RETURNS TRIGGER AS $$
DECLARE
    plan_type TEXT;
    created_at_date TIMESTAMP WITH TIME ZONE;
    current_count INTEGER;
    max_allowed INTEGER;
    cycle_start TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT subscription_plan, profiles.created_at INTO plan_type, created_at_date 
    FROM profiles WHERE id = NEW.teacher_id;
    
    -- Definir el inicio del ciclo actual (cada 30 días desde la creación o fecha de alta)
    -- Por simplicidad, usamos los últimos 30 días móviles para la versión actual
    cycle_start := now() - interval '30 days';
    
    -- Contar todas las clases creadas en este ciclo de 30 días
    SELECT COUNT(*) INTO current_count FROM classes 
    WHERE teacher_id = NEW.teacher_id 
    AND created_at > cycle_start;
    
    IF plan_type = 'zen' THEN max_allowed := 12;
    ELSIF plan_type = 'namaste' THEN max_allowed := 80;
    ELSIF plan_type = 'escuela' THEN max_allowed := 999999;
    ELSE max_allowed := 12;
    END IF;
    
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Has alcanzado el límite mensual de clases para tu plan % (% clases/mes). Por favor, mejora tu plan para seguir publicando.', plan_type, max_allowed;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Asegurar que el trigger esté activo
DROP TRIGGER IF EXISTS tr_check_class_limit ON classes;
CREATE TRIGGER tr_check_class_limit
BEFORE INSERT ON classes
FOR EACH ROW
EXECUTE FUNCTION check_class_limit();

-- 3. Agregar columna de capacidad total compartida si no existe
ALTER TABLE classes ADD COLUMN IF NOT EXISTS total_capacity INTEGER DEFAULT 20;
