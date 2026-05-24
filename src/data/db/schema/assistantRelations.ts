import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { assistantTable } from './assistant';
import { createUpdateTimestamps } from './columnHelpers';

export const assistantMcpServerTable = sqliteTable(
  'assistant_mcp_server',
  {
    assistantId: text()
      .notNull()
      .references(() => assistantTable.id, { onDelete: 'cascade' }),
    mcpServerId: text().notNull(),
    ...createUpdateTimestamps,
  },
  (table) => [primaryKey({ columns: [table.assistantId, table.mcpServerId] })],
);

export const assistantKnowledgeBaseTable = sqliteTable(
  'assistant_knowledge_base',
  {
    assistantId: text()
      .notNull()
      .references(() => assistantTable.id, { onDelete: 'cascade' }),
    knowledgeBaseId: text().notNull(),
    ...createUpdateTimestamps,
  },
  (table) => [primaryKey({ columns: [table.assistantId, table.knowledgeBaseId] })],
);

export type AssistantKnowledgeBaseInsert = typeof assistantKnowledgeBaseTable.$inferInsert;
export type AssistantKnowledgeBaseSelect = typeof assistantKnowledgeBaseTable.$inferSelect;
export type AssistantMcpServerInsert = typeof assistantMcpServerTable.$inferInsert;
export type AssistantMcpServerSelect = typeof assistantMcpServerTable.$inferSelect;
