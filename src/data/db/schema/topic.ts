import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { assistantTable } from './assistant';
import {
  createUpdateDeleteTimestamps,
  orderKeyColumns,
  scopedOrderKeyIndex,
  uuidPrimaryKey,
} from './columnHelpers';
import { groupTable } from './group';

export const topicTable = sqliteTable(
  'topic',
  {
    activeNodeId: text(),
    assistantId: text().references(() => assistantTable.id, { onDelete: 'set null' }),
    groupId: text().references(() => groupTable.id, { onDelete: 'set null' }),
    id: uuidPrimaryKey(),
    isNameManuallyEdited: integer({ mode: 'boolean' }).notNull().default(false),
    name: text().notNull().default(''),
    ...orderKeyColumns,
    ...createUpdateDeleteTimestamps,
  },
  (table) => [
    index('topic_assistant_id_idx').on(table.assistantId),
    index('topic_group_updated_idx').on(table.groupId, table.updatedAt),
    index('topic_updated_at_idx').on(table.updatedAt),
    scopedOrderKeyIndex('topic', 'groupId')(table),
  ],
);

export type TopicInsert = typeof topicTable.$inferInsert;
export type TopicSelect = typeof topicTable.$inferSelect;
