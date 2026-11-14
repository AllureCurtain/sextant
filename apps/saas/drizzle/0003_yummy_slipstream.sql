CREATE TABLE `waitlist_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`source` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_entry_email_unique` ON `waitlist_entry` (`email`);