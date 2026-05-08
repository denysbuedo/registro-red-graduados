-- Añadir columna de ministerio para el rol DRI
ALTER TABLE users ADD COLUMN ministry TEXT;

-- Añadir columna de universidad pendiente para el flujo de registro
ALTER TABLE users ADD COLUMN pending_university TEXT;
