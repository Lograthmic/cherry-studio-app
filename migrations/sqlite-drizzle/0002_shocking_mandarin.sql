CREATE TABLE `assistant` (
	`description` text DEFAULT '' NOT NULL,
	`emoji` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`model_id` text,
	`name` text NOT NULL,
	`prompt` text DEFAULT '' NOT NULL,
	`settings` text NOT NULL,
	`order_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `user_model`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `assistant_created_at_idx` ON `assistant` (`created_at`);--> statement-breakpoint
CREATE INDEX `assistant_order_key_idx` ON `assistant` (`order_key`);--> statement-breakpoint
CREATE TABLE `group` (
	`entity_type` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `group_entity_type_order_key_idx` ON `group` (`entity_type`,`order_key`);--> statement-breakpoint
CREATE TABLE `message` (
	`data` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`model_id` text,
	`model_snapshot` text,
	`parent_id` text,
	`role` text NOT NULL,
	`searchable_text` text DEFAULT '' NOT NULL,
	`siblings_group_id` integer DEFAULT 0 NOT NULL,
	`stats` text,
	`status` text NOT NULL,
	`topic_id` text NOT NULL,
	`trace_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `user_model`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `message`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "message_role_check" CHECK("message"."role" IN ('user', 'assistant', 'system')),
	CONSTRAINT "message_status_check" CHECK("message"."status" IN ('pending', 'success', 'error', 'paused'))
);
--> statement-breakpoint
CREATE INDEX `message_parent_id_idx` ON `message` (`parent_id`);--> statement-breakpoint
CREATE INDEX `message_topic_created_idx` ON `message` (`topic_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `message_trace_id_idx` ON `message` (`trace_id`);--> statement-breakpoint
CREATE TABLE `pin` (
	`entity_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`order_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pin_entity_type_entity_id_unique_idx` ON `pin` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `pin_entity_type_order_key_idx` ON `pin` (`entity_type`,`order_key`);--> statement-breakpoint
CREATE TABLE `topic` (
	`active_node_id` text,
	`assistant_id` text,
	`group_id` text,
	`id` text PRIMARY KEY NOT NULL,
	`is_name_manually_edited` integer DEFAULT false NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`order_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`assistant_id`) REFERENCES `assistant`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `topic_assistant_id_idx` ON `topic` (`assistant_id`);--> statement-breakpoint
CREATE INDEX `topic_group_updated_idx` ON `topic` (`group_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `topic_updated_at_idx` ON `topic` (`updated_at`);--> statement-breakpoint
CREATE INDEX `topic_group_id_order_key_idx` ON `topic` (`group_id`,`order_key`);--> statement-breakpoint
CREATE TABLE `user_model` (
	`capabilities` text NOT NULL,
	`context_window` integer,
	`custom_endpoint_url` text,
	`description` text,
	`endpoint_types` text,
	`group` text,
	`id` text PRIMARY KEY NOT NULL,
	`input_modalities` text,
	`is_deprecated` integer DEFAULT false NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`is_hidden` integer DEFAULT false NOT NULL,
	`max_input_tokens` integer,
	`max_output_tokens` integer,
	`model_id` text NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`output_modalities` text,
	`parameters` text,
	`preset_model_id` text,
	`pricing` text,
	`provider_id` text NOT NULL,
	`reasoning` text,
	`order_key` text NOT NULL,
	`supports_streaming` integer DEFAULT true NOT NULL,
	`user_overrides` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `user_provider`(`provider_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_model_preset_idx` ON `user_model` (`preset_model_id`);--> statement-breakpoint
CREATE INDEX `user_model_provider_enabled_idx` ON `user_model` (`provider_id`,`is_enabled`);--> statement-breakpoint
CREATE INDEX `user_model_provider_id_order_key_idx` ON `user_model` (`provider_id`,`order_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_model_provider_model_unique` ON `user_model` (`provider_id`,`model_id`);--> statement-breakpoint
CREATE TABLE `user_provider` (
	`api_features` text,
	`api_keys` text DEFAULT '[]',
	`auth_config` text,
	`default_chat_endpoint` text,
	`endpoint_configs` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`preset_provider_id` text,
	`provider_id` text PRIMARY KEY NOT NULL,
	`provider_settings` text,
	`order_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_provider_enabled_idx` ON `user_provider` (`is_enabled`);--> statement-breakpoint
CREATE INDEX `user_provider_preset_idx` ON `user_provider` (`preset_provider_id`);--> statement-breakpoint
CREATE INDEX `user_provider_order_key_idx` ON `user_provider` (`order_key`);
