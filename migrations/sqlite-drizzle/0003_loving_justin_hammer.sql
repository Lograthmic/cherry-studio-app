CREATE TABLE `assistant_knowledge_base` (
	`assistant_id` text NOT NULL,
	`knowledge_base_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`assistant_id`, `knowledge_base_id`),
	FOREIGN KEY (`assistant_id`) REFERENCES `assistant`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assistant_mcp_server` (
	`assistant_id` text NOT NULL,
	`mcp_server_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`assistant_id`, `mcp_server_id`),
	FOREIGN KEY (`assistant_id`) REFERENCES `assistant`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `entity_tag` (
	`entity_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`entity_type`, `entity_id`, `tag_id`),
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `entity_tag_tag_id_idx` ON `entity_tag` (`tag_id`);--> statement-breakpoint
CREATE INDEX `entity_tag_entity_idx` ON `entity_tag` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `tag` (
	`color` text,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_name_unique_idx` ON `tag` (`name`);