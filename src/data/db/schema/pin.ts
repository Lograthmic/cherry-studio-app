import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import {
  createUpdateTimestamps,
  orderKeyColumns,
  scopedOrderKeyIndex,
  uuidPrimaryKey,
} from './columnHelpers';

export const pinTable = sqliteTable(
  'pin',
  {
    entityId: text().notNull(),
    entityType: text().notNull(),
    id: uuidPrimaryKey(),
    ...orderKeyColumns,
    ...createUpdateTimestamps,
  },
  (table) => [
    uniqueIndex('pin_entity_type_entity_id_unique_idx').on(table.entityType, table.entityId),
    scopedOrderKeyIndex('pin', 'entityType')(table),
  ],
);

export type PinInsert = typeof pinTable.$inferInsert;
export type PinSelect = typeof pinTable.$inferSelect;
