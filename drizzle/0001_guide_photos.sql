CREATE TABLE `guide_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guide_id` integer NOT NULL,
	`r2_key` text NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`guide_id`) REFERENCES `guides`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guide_photos_guide_idx` ON `guide_photos` (`guide_id`,`sort_order`);