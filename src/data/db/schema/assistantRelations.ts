import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createUpdateTimestamps } from './_columnHelpers';
import { assistantTable } from './assistant';

// NOTE: assistant-model relationship is 1:1 (default model) stored as assistant.modelId.
// Multi-model (@mention) list is ephemeral UI state stored in persist-cache.

/**
 * Assistant-McpServer junction table
 *
 * Associates assistants with MCP servers.
 * Both sides CASCADE on assistant deletion; MCP server FK is omitted until
 * mobile migrates the MCP schema.
 */
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

/**
 * Assistant-KnowledgeBase junction table
 *
 * Associates assistants with knowledge bases.
 * Both sides CASCADE on assistant deletion; knowledge FK is omitted until
 * mobile migrates the knowledge schema.
 */
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
