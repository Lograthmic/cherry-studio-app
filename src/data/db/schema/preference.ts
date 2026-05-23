import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createUpdateTimestamps } from './columnHelpers';

export const preferenceTable = sqliteTable(
  'preference',
  {
    // scope is reserved for future use; now only 'default' is supported.
    scope: text().notNull().default('default'),
    key: text().notNull(),
    value: text({ mode: 'json' }),
    ...createUpdateTimestamps,
  },
  (table) => [primaryKey({ columns: [table.scope, table.key] })],
);

export type PreferenceInsert = typeof preferenceTable.$inferInsert;
export type PreferenceSelect = typeof preferenceTable.$inferSelect;
