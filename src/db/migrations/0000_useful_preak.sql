CREATE TABLE `connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sender_id` integer NOT NULL,
	`receiver_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`sender_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`filter_university` text,
	`filter_career` text,
	`filter_country` text,
	`filter_year_from` integer,
	`filter_year_to` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `graduates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`country` text NOT NULL,
	`city` text,
	`university` text NOT NULL,
	`career` text NOT NULL,
	`graduation_year` integer NOT NULL,
	`current_profession` text NOT NULL,
	`current_company` text,
	`bio` text,
	`photo_url` text,
	`phone` text,
	`linkedin` text,
	`skills` text,
	`languages` text,
	`interests` text,
	`website` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `graduates_email_unique` ON `graduates` (`email`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`graduate_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`graduate_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE no action
);
