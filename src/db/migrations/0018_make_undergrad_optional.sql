PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_graduates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`country` text NOT NULL,
	`city` text,
	`university` text,
	`career` text,
	`graduation_year` integer,
	`current_profession` text NOT NULL,
	`current_company` text,
	`bio` text,
	`photo_url` text,
	`phone` text NOT NULL,
	`birth_date` text NOT NULL,
	`birth_country` text NOT NULL,
	`passport` text,
	`pregrado_modalidad` text,
	`postgrado_university` text,
	`postgrado_program` text,
	`postgrado_year` integer,
	`other_academic_program` text,
	`other_cuban_institution` text,
	`linkedin` text,
	`skills` text,
	`languages` text,
	`interests` text,
	`website` text,
	`created_at` integer,
	`updated_at` integer
);
INSERT INTO `__new_graduates`("id", "user_id", "name", "email", "country", "city", "university", "career", "graduation_year", "current_profession", "current_company", "bio", "photo_url", "phone", "birth_date", "birth_country", "passport", "pregrado_modalidad", "postgrado_university", "postgrado_program", "postgrado_year", "other_academic_program", "other_cuban_institution", "linkedin", "skills", "languages", "interests", "website", "created_at", "updated_at") SELECT "id", "user_id", "name", "email", "country", "city", "university", "career", "graduation_year", "current_profession", "current_company", "bio", "photo_url", "phone", "birth_date", "birth_country", "passport", "pregrado_modalidad", "postgrado_university", "postgrado_program", "postgrado_year", "other_academic_program", "other_cuban_institution", "linkedin", "skills", "languages", "interests", "website", "created_at", "updated_at" FROM `graduates`;
DROP TABLE `graduates`;
ALTER TABLE `__new_graduates` RENAME TO `graduates`;
PRAGMA foreign_keys=ON;
CREATE UNIQUE INDEX `graduates_email_unique` ON `graduates` (`email`);
