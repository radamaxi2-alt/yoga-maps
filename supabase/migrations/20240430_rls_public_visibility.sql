-- Asegurar que la tabla profiles sea visible para todos (SELECT)
-- Esto permite que los alumnos y usuarios anónimos vean a los profesores
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfiles visibles para todos" ON profiles;
CREATE POLICY "Perfiles visibles para todos" ON profiles
FOR SELECT USING (true);

-- Asegurar que teacher_details sea visible para todos
ALTER TABLE teacher_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Detalles de profesores visibles para todos" ON teacher_details;
CREATE POLICY "Detalles de profesores visibles para todos" ON teacher_details
FOR SELECT USING (true);

-- Asegurar que classes sean visibles para todos
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clases visibles para todos" ON classes;
CREATE POLICY "Clases visibles para todos" ON classes
FOR SELECT USING (true);
