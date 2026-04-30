-- 1. Añadir columna de plan y community_score
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'zen';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_score INTEGER DEFAULT 0;

-- 2. Asegurar que los niveles sean válidos
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_subscription_plan;
ALTER TABLE profiles ADD CONSTRAINT check_subscription_plan CHECK (subscription_plan IN ('zen', 'namaste', 'escuela'));

-- 3. Función para sumar puntos (10 pts por post o clase)
CREATE OR REPLACE FUNCTION increment_community_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'posts' THEN
    UPDATE profiles SET community_score = community_score + 10 WHERE id = NEW.author_id;
  ELSIF TG_TABLE_NAME = 'classes' THEN
    UPDATE profiles SET community_score = community_score + 10 WHERE id = NEW.teacher_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Triggers
DROP TRIGGER IF EXISTS tr_score_post ON posts;
CREATE TRIGGER tr_score_post AFTER INSERT ON posts FOR EACH ROW EXECUTE FUNCTION increment_community_score();

DROP TRIGGER IF EXISTS tr_score_class ON classes;
CREATE TRIGGER tr_score_class AFTER INSERT ON classes FOR EACH ROW EXECUTE FUNCTION increment_community_score();
