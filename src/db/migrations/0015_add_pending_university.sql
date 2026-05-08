-- Añadir columna de institución para el rol "institution" (Vicedecanos/DRI locales)
ALTER TABLE users ADD COLUMN institution_name TEXT;

-- Añadir columna de ministerio para el rol DRI (Ministerial)
ALTER TABLE users ADD COLUMN ministry TEXT;

-- Añadir columna de universidad pendiente para el flujo de registro
ALTER TABLE users ADD COLUMN pending_university TEXT;
