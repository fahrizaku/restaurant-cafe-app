CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `table_sessions` ADD `payment_proof` text;