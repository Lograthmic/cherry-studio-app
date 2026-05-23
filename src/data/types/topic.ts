/**
 * Topic entity types
 *
 * Topics are containers for messages. They reference the last-used assistant
 * and can be organized into groups.
 */

import * as z from 'zod';

import type { CursorPaginationParams } from './apiTypes';

export const TopicIdSchema = z.uuidv4();
export const TopicNameSchema = z.string().min(1).max(255);
/** Entity-side name validator: DB DEFAULT '' means a stored row may have an empty name. */
export const TopicNameEntitySchema = z.string().max(255);

/**
 * Complete topic entity as stored in database.
 */
export const TopicSchema = z.strictObject({
  /** Topic ID */
  id: TopicIdSchema,
  /** Topic name (may be '' for untitled topics; DTO callers should validate non-empty via TopicNameSchema). */
  name: TopicNameEntitySchema,
  /** Whether the name was manually edited by user */
  isNameManuallyEdited: z.boolean(),
  /** Last-used assistant ID (updated on message send) */
  assistantId: z.string().optional(),
  /** Active node ID in the message tree */
  activeNodeId: z.string().optional(),
  /** Group ID for organization */
  groupId: z.string().optional(),
  /** Fractional-indexing order key, partitioned by groupId. */
  orderKey: z.string(),
  /** Creation timestamp (ISO string) */
  createdAt: z.iso.datetime(),
  /** Last update timestamp (ISO string) */
  updatedAt: z.iso.datetime(),
});
export type Topic = z.infer<typeof TopicSchema>;

export const CreateTopicSchema = TopicSchema.pick({
  assistantId: true,
  groupId: true,
  name: true,
})
  .partial()
  .extend({
    sourceNodeId: z.string().optional(),
  });
export type CreateTopicDto = z.infer<typeof CreateTopicSchema>;

export const UpdateTopicSchema = TopicSchema.pick({
  assistantId: true,
  groupId: true,
  isNameManuallyEdited: true,
  name: true,
}).partial();
export type UpdateTopicDto = z.infer<typeof UpdateTopicSchema>;

export const ListTopicsQuerySchema = z.strictObject({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  q: z.string().optional(),
});
export type ListTopicsQuery = z.infer<typeof ListTopicsQuerySchema> & CursorPaginationParams;

export const SetActiveNodeSchema = z.strictObject({
  nodeId: z.string().min(1),
});
export type SetActiveNodeDto = z.infer<typeof SetActiveNodeSchema>;

export interface ActiveNodeResponse {
  activeNodeId: string;
}

export const OrderRequestSchema = z.union([
  z.strictObject({ after: z.string().min(1) }),
  z.strictObject({ before: z.string().min(1) }),
  z.strictObject({ position: z.enum(['first', 'last']) }),
]);
export type OrderRequest = z.infer<typeof OrderRequestSchema>;
