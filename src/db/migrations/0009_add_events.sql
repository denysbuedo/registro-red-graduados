CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`date` integer NOT NULL,
	`location` text,
	`type` text NOT NULL,
	`link` text,
	`organizer_id` integer NOT NULL,
	`max_attendees` integer,
	`created_at` integer,
	FOREIGN KEY (`organizer_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_attendees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`graduate_id` integer NOT NULL,
	`status` text DEFAULT 'attending' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`graduate_id`) REFERENCES `graduates`(`id`) ON UPDATE no action ON DELETE cascade
);
