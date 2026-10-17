CREATE TABLE `community_routes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`author` text NOT NULL,
	`publisher_type` text NOT NULL,
	`name` text NOT NULL,
	`sport` text NOT NULL,
	`description` text NOT NULL,
	`color` text NOT NULL,
	`geometry` text NOT NULL,
	`distance` real NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `routes_owner_idx` ON `community_routes` (`owner_id`);--> statement-breakpoint
CREATE INDEX `routes_created_idx` ON `community_routes` (`created_at`);--> statement-breakpoint
CREATE TABLE `route_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`reporter_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL
);
