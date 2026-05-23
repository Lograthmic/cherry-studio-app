import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const createTimestamp = () => Date.now();

export const appStateTable = sqliteTable('app_state', {
  key: text().primaryKey(),
  value: text({ mode: 'json' }).notNull(), // JSON field, Drizzle handles serialization automatically.
  description: text(), // Optional description field.
  createdAt: integer().notNull().$defaultFn(createTimestamp),
  updatedAt: integer().notNull().$defaultFn(createTimestamp).$onUpdateFn(createTimestamp),
});

export type AppStateInsert = typeof appStateTable.$inferInsert;
export type AppStateSelect = typeof appStateTable.$inferSelect;
