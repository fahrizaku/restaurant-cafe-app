ALTER TABLE `orders` ADD `payment_status` text DEFAULT 'unpaid' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_method` text;
