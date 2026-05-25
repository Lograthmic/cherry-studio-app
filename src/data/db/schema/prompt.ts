import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import {
  createUpdateTimestamps,
  orderKeyColumns,
  orderKeyIndex,
  uuidPrimaryKey,
} from './_columnHelpers';

/**
 * Prompt table - user prompt snippets (replaces legacy QuickPhrase).
 */
export const promptTable = sqliteTable(
  'prompt',
  {
    id: uuidPrimaryKey(),
    title: text().notNull(),
    content: text().notNull(),
    ...orderKeyColumns,
    ...createUpdateTimestamps,
  },
  (table) => [orderKeyIndex('prompt')(table)],
);

export type PromptInsert = typeof promptTable.$inferInsert;
export type PromptSelect = typeof promptTable.$inferSelect;
