import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

import type {
  EndpointType,
  Modality,
  ModelCapability,
  ParameterSupport,
  ReasoningConfig,
  RuntimeModelPricing,
} from '@/data/types/model';

import { createUpdateTimestamps, orderKeyColumns, scopedOrderKeyIndex } from './columnHelpers';
import { userProviderTable } from './userProvider';

export const registryEnrichableFields = [
  'name',
  'description',
  'capabilities',
  'inputModalities',
  'outputModalities',
  'endpointTypes',
  'contextWindow',
  'maxInputTokens',
  'maxOutputTokens',
  'supportsStreaming',
  'reasoning',
  'parameters',
  'pricing',
] as const;

export type RegistryEnrichableField = (typeof registryEnrichableFields)[number];

const registryEnrichableFieldSet: ReadonlySet<string> = new Set(registryEnrichableFields);

export function isRegistryEnrichableField(field: string): field is RegistryEnrichableField {
  return registryEnrichableFieldSet.has(field);
}

export const userModelTable = sqliteTable(
  'user_model',
  {
    capabilities: text({ mode: 'json' })
      .$type<ModelCapability[]>()
      .notNull()
      .$defaultFn(() => []),
    contextWindow: integer(),
    customEndpointUrl: text(),
    description: text(),
    endpointTypes: text({ mode: 'json' }).$type<EndpointType[]>(),
    group: text(),
    id: text().primaryKey(),
    inputModalities: text({ mode: 'json' }).$type<Modality[]>(),
    isDeprecated: integer({ mode: 'boolean' }).notNull().default(false),
    isEnabled: integer({ mode: 'boolean' }).notNull().default(true),
    isHidden: integer({ mode: 'boolean' }).notNull().default(false),
    maxInputTokens: integer(),
    maxOutputTokens: integer(),
    modelId: text().notNull(),
    name: text().notNull(),
    notes: text(),
    outputModalities: text({ mode: 'json' }).$type<Modality[]>(),
    parameters: text({ mode: 'json' }).$type<ParameterSupport>(),
    presetModelId: text(),
    pricing: text({ mode: 'json' }).$type<RuntimeModelPricing>(),
    providerId: text()
      .notNull()
      .references(() => userProviderTable.providerId, { onDelete: 'cascade' }),
    reasoning: text({ mode: 'json' }).$type<ReasoningConfig>(),
    ...orderKeyColumns,
    supportsStreaming: integer({ mode: 'boolean' }).notNull().default(true),
    userOverrides: text({ mode: 'json' }).$type<RegistryEnrichableField[]>(),
    ...createUpdateTimestamps,
  },
  (table) => [
    index('user_model_preset_idx').on(table.presetModelId),
    index('user_model_provider_enabled_idx').on(table.providerId, table.isEnabled),
    scopedOrderKeyIndex('user_model', 'providerId')(table),
    unique('user_model_provider_model_unique').on(table.providerId, table.modelId),
  ],
);

export type UserModelInsert = typeof userModelTable.$inferInsert;
export type UserModelSelect = typeof userModelTable.$inferSelect;
