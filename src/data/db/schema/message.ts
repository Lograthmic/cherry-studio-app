import { sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { MessageData, MessageStats, ModelSnapshot } from '@/data/types/message';

import { createUpdateDeleteTimestamps, uuidPrimaryKeyOrdered } from './columnHelpers';
import { topicTable } from './topic';
import { userModelTable } from './userModel';

export const messageTable = sqliteTable(
  'message',
  {
    data: text({ mode: 'json' }).$type<MessageData>().notNull(),
    id: uuidPrimaryKeyOrdered(),
    modelId: text().references(() => userModelTable.id, { onDelete: 'set null' }),
    modelSnapshot: text({ mode: 'json' }).$type<ModelSnapshot>(),
    parentId: text(),
    role: text().notNull(),
    searchableText: text().notNull().default(''),
    siblingsGroupId: integer().notNull().default(0),
    stats: text({ mode: 'json' }).$type<MessageStats>(),
    status: text().notNull(),
    topicId: text()
      .notNull()
      .references(() => topicTable.id, { onDelete: 'cascade' }),
    traceId: text(),
    ...createUpdateDeleteTimestamps,
  },
  (table) => [
    check('message_role_check', sql`${table.role} IN ('user', 'assistant', 'system')`),
    check(
      'message_status_check',
      sql`${table.status} IN ('pending', 'success', 'error', 'paused')`,
    ),
    foreignKey({ columns: [table.parentId], foreignColumns: [table.id] }).onDelete('set null'),
    index('message_parent_id_idx').on(table.parentId),
    index('message_topic_created_idx').on(table.topicId, table.createdAt),
    index('message_trace_id_idx').on(table.traceId),
  ],
);

const messageSearchableTextExpression = (rowAlias: string) => `COALESCE((
  SELECT group_concat(search_text, ' ')
  FROM (
    SELECT CASE
      WHEN json_extract(value, '$.type') IN ('text', 'reasoning')
        THEN json_extract(value, '$.text')
      WHEN json_extract(value, '$.type') IN ('data-translation', 'data-compact', 'data-code')
        THEN json_extract(value, '$.data.content')
      ELSE NULL
    END AS search_text
    FROM json_each(json_extract(${rowAlias}.data, '$.parts'))
  )
  WHERE search_text IS NOT NULL AND search_text != ''
), '')`;

export const MESSAGE_FTS_STATEMENTS: string[] = [
  `CREATE VIRTUAL TABLE IF NOT EXISTS message_fts USING fts5(
    searchable_text,
    content='message',
    content_rowid='rowid',
    tokenize='trigram'
  )`,
  `CREATE TRIGGER IF NOT EXISTS message_ai AFTER INSERT ON message BEGIN
    UPDATE message SET searchable_text = ${messageSearchableTextExpression('NEW')} WHERE id = NEW.id;
    INSERT INTO message_fts(rowid, searchable_text)
    SELECT rowid, searchable_text FROM message WHERE id = NEW.id;
  END`,
  `CREATE TRIGGER IF NOT EXISTS message_ad AFTER DELETE ON message BEGIN
    INSERT INTO message_fts(message_fts, rowid, searchable_text)
    VALUES ('delete', OLD.rowid, OLD.searchable_text);
  END`,
  `CREATE TRIGGER IF NOT EXISTS message_au AFTER UPDATE OF data ON message BEGIN
    INSERT INTO message_fts(message_fts, rowid, searchable_text)
    VALUES ('delete', OLD.rowid, OLD.searchable_text);
    UPDATE message SET searchable_text = ${messageSearchableTextExpression('NEW')} WHERE id = NEW.id;
    INSERT INTO message_fts(rowid, searchable_text)
    SELECT rowid, searchable_text FROM message WHERE id = NEW.id;
  END`,
];

export type MessageInsert = typeof messageTable.$inferInsert;
export type MessageSelect = typeof messageTable.$inferSelect;
