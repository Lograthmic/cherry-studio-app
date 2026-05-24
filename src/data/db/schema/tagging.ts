import { index, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { createUpdateTimestamps, uuidPrimaryKey } from './columnHelpers';

export const tagTable = sqliteTable(
  'tag',
  {
    color: text(),
    id: uuidPrimaryKey(),
    name: text().notNull(),
    ...createUpdateTimestamps,
  },
  (table) => [uniqueIndex('tag_name_unique_idx').on(table.name)],
);

export const entityTagTable = sqliteTable(
  'entity_tag',
  {
    entityId: text().notNull(),
    entityType: text().notNull(),
    tagId: text()
      .notNull()
      .references(() => tagTable.id, { onDelete: 'cascade' }),
    ...createUpdateTimestamps,
  },
  (table) => [
    primaryKey({ columns: [table.entityType, table.entityId, table.tagId] }),
    index('entity_tag_tag_id_idx').on(table.tagId),
    index('entity_tag_entity_idx').on(table.entityType, table.entityId),
  ],
);

export type EntityTagInsert = typeof entityTagTable.$inferInsert;
export type EntityTagSelect = typeof entityTagTable.$inferSelect;
export type TagInsert = typeof tagTable.$inferInsert;
export type TagSelect = typeof tagTable.$inferSelect;
