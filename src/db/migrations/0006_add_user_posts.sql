CREATE TABLE `user_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`graduate_id` integer NOT NULL,
	`content` text NOT NULL,
	`image_url` text,
	`likes` integer DEFAULT 0,
	`comments_count` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`graduate_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE cascade
);
