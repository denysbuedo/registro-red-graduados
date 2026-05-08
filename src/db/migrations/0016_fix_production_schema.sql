-- REPARACIÓN DE TABLA USERS
ALTER TABLE users ADD COLUMN institution_name TEXT;
ALTER TABLE users ADD COLUMN ministry TEXT;
ALTER TABLE users ADD COLUMN pending_university TEXT;
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE users ADD COLUMN rejection_reason TEXT;

-- REPARACIÓN DE TABLA GRADUATES
ALTER TABLE graduates ADD COLUMN birth_date TEXT;
ALTER TABLE graduates ADD COLUMN birth_country TEXT;
ALTER TABLE graduates ADD COLUMN passport TEXT;
ALTER TABLE graduates ADD COLUMN pregrado_modalidad TEXT;
ALTER TABLE graduates ADD COLUMN postgrado_university TEXT;
ALTER TABLE graduates ADD COLUMN postgrado_program TEXT;
ALTER TABLE graduates ADD COLUMN postgrado_year INTEGER;
ALTER TABLE graduates ADD COLUMN other_academic_program TEXT;
ALTER TABLE graduates ADD COLUMN other_cuban_institution TEXT;
