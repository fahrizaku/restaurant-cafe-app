-- Hapus tabel lama (data dev bisa dihapus)
DROP TABLE IF EXISTS `order_items`;
--> statement-breakpoint
DROP TABLE IF EXISTS `orders`;
--> statement-breakpoint

-- Sesi meja: satu per kunjungan, bisa punya banyak batch order
CREATE TABLE `table_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`table_id` text NOT NULL,
	`status` text NOT NULL DEFAULT 'open',
	`payment_status` text NOT NULL DEFAULT 'unpaid',
	`payment_method` text,
	`total_price` real NOT NULL DEFAULT 0,
	`opened_at` integer,
	`closed_at` integer,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Batch order: setiap kali customer klik "Place Order"
CREATE TABLE `order_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`status` text NOT NULL DEFAULT 'pending',
	`total_price` real NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `table_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Item dalam batch
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`menu_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_at_time` real NOT NULL,
	`notes` text,
	FOREIGN KEY (`batch_id`) REFERENCES `order_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE no action
);
