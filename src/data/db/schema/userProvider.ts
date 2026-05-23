import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type {
  ApiFeatures,
  ApiKeyEntry,
  AuthConfig,
  EndpointConfig,
  EndpointConfigs,
  ProviderSettings,
} from '@/data/types/provider';

import { createUpdateTimestamps, orderKeyColumns, orderKeyIndex } from './columnHelpers';

export const userProviderTable = sqliteTable(
  'user_provider',
  {
    apiFeatures: text('api_features', { mode: 'json' }).$type<ApiFeatures>(),
    apiKeys: text({ mode: 'json' }).$type<ApiKeyEntry[]>().default([]),
    authConfig: text({ mode: 'json' }).$type<AuthConfig>(),
    defaultChatEndpoint: text().$type<keyof EndpointConfigs>(),
    endpointConfigs: text('endpoint_configs', { mode: 'json' }).$type<
      Partial<Record<string, EndpointConfig>>
    >(),
    isEnabled: integer({ mode: 'boolean' }).notNull().default(true),
    name: text().notNull(),
    presetProviderId: text(),
    providerId: text().primaryKey(),
    providerSettings: text({ mode: 'json' }).$type<ProviderSettings>(),
    ...orderKeyColumns,
    ...createUpdateTimestamps,
  },
  (table) => [
    index('user_provider_enabled_idx').on(table.isEnabled),
    index('user_provider_preset_idx').on(table.presetProviderId),
    orderKeyIndex('user_provider')(table),
  ],
);

export type UserProviderInsert = typeof userProviderTable.$inferInsert;
export type UserProviderSelect = typeof userProviderTable.$inferSelect;
