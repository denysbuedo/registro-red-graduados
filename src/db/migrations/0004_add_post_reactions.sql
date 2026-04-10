CREATE TABLE `post_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`reaction_type` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`post_id`) REFERENCES `admin_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_reactions_post_user_unique` ON `post_reactions` (`post_id`, `user_id`);
