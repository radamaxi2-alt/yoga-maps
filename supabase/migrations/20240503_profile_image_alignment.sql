-- Agregar columna para el posicionamiento de la portada
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_position INTEGER DEFAULT 50;

-- Comentario para documentación
COMMENT ON COLUMN profiles.cover_position IS 'Posicionamiento vertical de la foto de portada (0-100%)';
