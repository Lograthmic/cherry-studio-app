import * as z from 'zod';
import type { OffsetPaginationParams } from './apiTypes';
import { UniqueModelIdSchema } from './model';
import { TagIdSchema, TagSchema } from './tag';
import { OrderRequestSchema } from './topic';

export const McpModeSchema = z.enum(['disabled', 'auto', 'manual']);
export type McpMode = z.infer<typeof McpModeSchema>;

export const AssistantSettingsSchema = z.object({
  customParameters: z.array(
    z.discriminatedUnion('type', [
      z.object({ name: z.string(), type: z.literal('string'), value: z.string() }),
      z.object({ name: z.string(), type: z.literal('number'), value: z.number() }),
      z.object({ name: z.string(), type: z.literal('boolean'), value: z.boolean() }),
      z.object({ name: z.string(), type: z.literal('json'), value: z.unknown() }),
    ]),
  ),
  enableMaxTokens: z.boolean(),
  enableMaxToolCalls: z.boolean(),
  enableTemperature: z.boolean(),
  enableTopP: z.boolean(),
  enableWebSearch: z.boolean(),
  maxTokens: z.number().int().positive(),
  maxToolCalls: z.number().int().positive(),
  mcpMode: McpModeSchema,
  reasoning_effort: z.string(),
  streamOutput: z.boolean(),
  temperature: z.number().min(0).max(2),
  toolUseMode: z.enum(['function', 'prompt']),
  topP: z.number().min(0).max(1),
});
export type AssistantSettings = z.infer<typeof AssistantSettingsSchema>;

export const DEFAULT_ASSISTANT_ID = 'default' as const;

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
  customParameters: [],
  enableMaxTokens: false,
  enableMaxToolCalls: true,
  enableTemperature: false,
  enableTopP: false,
  enableWebSearch: false,
  maxTokens: 4096,
  maxToolCalls: 20,
  mcpMode: 'auto',
  reasoning_effort: 'default',
  streamOutput: true,
  temperature: 1,
  toolUseMode: 'function',
  topP: 1,
};

export const AssistantIdSchema = z.uuidv4();

export const AssistantSchema = z.strictObject({
  createdAt: z.iso.datetime(),
  description: z.string(),
  emoji: z.string(),
  id: AssistantIdSchema,
  knowledgeBaseIds: z.array(z.string()),
  mcpServerIds: z.array(z.string()),
  modelId: UniqueModelIdSchema.nullable(),
  modelName: z.string().nullable(),
  name: z.string().min(1),
  prompt: z.string(),
  settings: AssistantSettingsSchema,
  tags: z.array(TagSchema),
  updatedAt: z.iso.datetime(),
});
export type Assistant = z.infer<typeof AssistantSchema>;

const ASSISTANT_MUTABLE_FIELDS = {
  description: true,
  emoji: true,
  knowledgeBaseIds: true,
  mcpServerIds: true,
  modelId: true,
  name: true,
  prompt: true,
  settings: true,
} as const;

const TagIdsField = z.array(TagIdSchema).optional();

export const CreateAssistantSchema = AssistantSchema.pick(ASSISTANT_MUTABLE_FIELDS)
  .partial()
  .required({ name: true })
  .extend({ tagIds: TagIdsField });
export type CreateAssistantDto = z.infer<typeof CreateAssistantSchema>;

export const UpdateAssistantSchema = AssistantSchema.pick(ASSISTANT_MUTABLE_FIELDS)
  .partial()
  .extend({
    settings: AssistantSettingsSchema.partial().optional(),
    tagIds: TagIdsField,
  });
export type UpdateAssistantDto = z.infer<typeof UpdateAssistantSchema>;

export const ASSISTANTS_DEFAULT_PAGE = 1;
export const ASSISTANTS_DEFAULT_LIMIT = 100;
export const ASSISTANTS_MAX_LIMIT = 500;

export const ListAssistantsQuerySchema = z.strictObject({
  id: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(ASSISTANTS_MAX_LIMIT)
    .default(ASSISTANTS_DEFAULT_LIMIT),
  page: z.coerce.number().int().positive().default(ASSISTANTS_DEFAULT_PAGE),
  search: z.string().trim().min(1).optional(),
  tagIds: z.array(TagIdSchema).min(1).optional(),
});
export type ListAssistantsQueryParams = z.input<typeof ListAssistantsQuerySchema> &
  OffsetPaginationParams;
export type ListAssistantsQuery = z.output<typeof ListAssistantsQuerySchema>;

export const ReorderAssistantSchema = OrderRequestSchema;
export type ReorderAssistantDto = z.infer<typeof ReorderAssistantSchema>;

export const ReorderAssistantsBatchSchema = z.strictObject({
  moves: z
    .array(
      z.strictObject({
        anchor: OrderRequestSchema,
        id: z.string().min(1),
      }),
    )
    .min(1),
});
export type ReorderAssistantsBatchDto = z.infer<typeof ReorderAssistantsBatchSchema>;
