import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { AssistantSettings } from '@/data/types/assistant';

import {
  createUpdateDeleteTimestamps,
  orderKeyColumns,
  orderKeyIndex,
  uuidPrimaryKey,
} from './columnHelpers';
import { userModelTable } from './userModel';

export const assistantTable = sqliteTable(
  'assistant',
  {
    description: text().notNull().default(''),
    emoji: text().notNull(),
    id: uuidPrimaryKey(),
    modelId: text().references(() => userModelTable.id, { onDelete: 'set null' }),
    name: text().notNull(),
    prompt: text().notNull().default(''),
    settings: text({ mode: 'json' }).$type<AssistantSettings>().notNull(),
    ...orderKeyColumns,
    ...createUpdateDeleteTimestamps,
  },
  (table) => [
    index('assistant_created_at_idx').on(table.createdAt),
    orderKeyIndex('assistant')(table),
  ],
);

export type AssistantInsert = typeof assistantTable.$inferInsert;
export type AssistantSelect = typeof assistantTable.$inferSelect;
