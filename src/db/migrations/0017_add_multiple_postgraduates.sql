-- Tabla para múltiples postgrados
CREATE TABLE `graduate_postgraduates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`graduate_id` integer NOT NULL,
	`program` text NOT NULL,
	`university` text NOT NULL,
	`year` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`graduate_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Migrar datos existentes de la tabla graduates a la nueva tabla
INSERT INTO graduate_postgraduates (graduate_id, program, university, year)
SELECT id, postgrado_program, postgrado_university, postgrado_year 
FROM graduates 
WHERE postgrado_program IS NOT NULL AND postgrado_program != '';

-- Nota: No eliminamos las columnas viejas aún para evitar errores de breaking change en caliente, 
-- pero la aplicación empezará a usar la nueva tabla.
