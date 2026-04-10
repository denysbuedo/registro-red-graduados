CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`graduate_id` integer,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`graduate_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
ALTER TABLE `graduates` ADD COLUMN `user_id` integer REFERENCES `users`(`id`);
