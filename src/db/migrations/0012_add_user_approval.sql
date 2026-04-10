-- Agregar nuevos campos a users para flujo de aprobación
ALTER TABLE `users` ADD COLUMN `status` text DEFAULT 'pending' NOT NULL;
ALTER TABLE `users` ADD COLUMN `rejection_reason` text;
-- Nota: El ENUM de role se actualiza en el schema de Drizzle
