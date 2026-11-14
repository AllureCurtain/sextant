CREATE TABLE `newsletter_subscriber` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`confirmed_at` integer,
	`unsubscribed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscriber_email_unique` ON `newsletter_subscriber` (`email`);--> statement-breakpoint
CREATE TABLE `user_file` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_file_key_unique` ON `user_file` (`key`);--> statement-breakpoint
CREATE INDEX `user_file_userId_idx` ON `user_file` (`user_id`);