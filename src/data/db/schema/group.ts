import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import {
  createUpdateTimestamps,
  orderKeyColumns,
  scopedOrderKeyIndex,
  uuidPrimaryKey,
} from './columnHelpers';

export const groupTable = sqliteTable(
  'group',
  {
    entityType: text().notNull(),
    id: uuidPrimaryKey(),
    name: text().notNull(),
    ...orderKeyColumns,
    ...createUpdateTimestamps,
  },
  (table) => [scopedOrderKeyIndex('group', 'entityType')(table)],
);

export type GroupInsert = typeof groupTable.$inferInsert;
export type GroupSelect = typeof groupTable.$inferSelect;
