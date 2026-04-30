-- 1. Agregar columnas de suscripción y score a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'zen';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '15 days');
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_score INTEGER DEFAULT 0;

-- 2. Agregar columnas de cupos híbridos a classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS capacity_presential INTEGER DEFAULT 10;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS capacity_online INTEGER DEFAULT 10;
-- Asegurar que jitsi_room_link sea genérico (ya es TEXT)

-- 3. Agregar modalidad a las reservas
ALTER TABLE class_reservations ADD COLUMN IF NOT EXISTS modality TEXT DEFAULT 'presential' CHECK (modality IN ('presential', 'online'));

-- 4. Función para verificar límites de clases según el plan
CREATE OR REPLACE FUNCTION check_class_limit()
RETURNS TRIGGER AS $$
DECLARE
    plan_type TEXT;
    current_count INTEGER;
    max_allowed INTEGER;
BEGIN
    SELECT subscription_plan INTO plan_type FROM profiles WHERE id = NEW.teacher_id;
    
    -- Contar solo clases activas (futuras)
    SELECT COUNT(*) INTO current_count FROM classes WHERE teacher_id = NEW.teacher_id AND scheduled_at > now();
    
    IF plan_type = 'zen' THEN max_allowed := 3;
    ELSIF plan_type = 'namaste' THEN max_allowed := 20;
    ELSIF plan_type = 'escuela' THEN max_allowed := 999999;
    ELSE max_allowed := 3;
    END IF;
    
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Has alcanzado el límite de clases para tu plan % (% clases)', plan_type, max_allowed;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar el límite antes de insertar una nueva clase
DROP TRIGGER IF EXISTS tr_check_class_limit ON classes;
CREATE TRIGGER tr_check_class_limit
BEFORE INSERT ON classes
FOR EACH ROW
EXECUTE FUNCTION check_class_limit();
