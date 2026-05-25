CREATE TABLE `prompt` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`order_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prompt_order_key_idx` ON `prompt` (`order_key`);--> statement-breakpoint
DROP INDEX `entity_tag_entity_idx`;--> statement-breakpoint
DROP INDEX `tag_name_unique_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `tag_name_unique` ON `tag` (`name`);--> statement-breakpoint
DROP TRIGGER IF EXISTS `message_ai`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `message_ad`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `message_au`;--> statement-breakpoint
CREATE VIRTUAL TABLE IF NOT EXISTS message_fts USING fts5(
    searchable_text,
    content='message',
    content_rowid='rowid',
    tokenize='trigram'
  );--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS message_ai AFTER INSERT ON message BEGIN
    UPDATE message SET searchable_text = COALESCE((
      SELECT group_concat(json_extract(value, '$.text'), ' ')
      FROM json_each(json_extract(NEW.data, '$.parts'))
      WHERE json_extract(value, '$.type') = 'text'
    ), '') WHERE id = NEW.id;
    INSERT INTO message_fts(rowid, searchable_text)
    SELECT rowid, searchable_text FROM message WHERE id = NEW.id;
  END;--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS message_ad AFTER DELETE ON message BEGIN
    INSERT INTO message_fts(message_fts, rowid, searchable_text)
    VALUES ('delete', OLD.rowid, OLD.searchable_text);
  END;--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS message_au AFTER UPDATE OF data ON message BEGIN
    INSERT INTO message_fts(message_fts, rowid, searchable_text)
    VALUES ('delete', OLD.rowid, OLD.searchable_text);
    UPDATE message SET searchable_text = COALESCE((
      SELECT group_concat(json_extract(value, '$.text'), ' ')
      FROM json_each(json_extract(NEW.data, '$.parts'))
      WHERE json_extract(value, '$.type') = 'text'
    ), '') WHERE id = NEW.id;
    INSERT INTO message_fts(rowid, searchable_text)
    SELECT rowid, searchable_text FROM message WHERE id = NEW.id;
  END;--> statement-breakpoint
UPDATE message SET searchable_text = COALESCE((
      SELECT group_concat(json_extract(value, '$.text'), ' ')
      FROM json_each(json_extract(message.data, '$.parts'))
      WHERE json_extract(value, '$.type') = 'text'
    ), '');--> statement-breakpoint
INSERT INTO message_fts(message_fts) VALUES ('rebuild');
