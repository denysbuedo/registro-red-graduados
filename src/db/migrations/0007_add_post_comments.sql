CREATE TABLE `post_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`graduate_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`post_id`) REFERENCES `user_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`graduate_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE cascade
);
