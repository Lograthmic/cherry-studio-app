import type {
  DataUIPart,
  DynamicToolUIPart,
  FileUIPart,
  InferUIMessageChunk,
  ReasoningUIPart,
  TextUIPart,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from 'ai';
import * as z from 'zod';

import type { CursorPaginationResponse } from './apiTypes';
import type { CherryDataPartTypes } from './uiParts';

export const MessageStatsSchema = z.strictObject({
  completionTokens: z.number().optional(),
  cost: z.number().optional(),
  promptTokens: z.number().optional(),
  thoughtsTokens: z.number().optional(),
  timeCompletionMs: z.number().optional(),
  timeFirstTokenMs: z.number().optional(),
  timeThinkingMs: z.number().optional(),
  totalTokens: z.number().optional(),
});
export type MessageStats = z.infer<typeof MessageStatsSchema>;

export type CherryMessagePart = UIMessagePart<CherryDataPartTypes, UITools>;

export interface MessageData {
  /** @deprecated Mobile writes and renders `parts` only. Kept to match Cherry's shared type. */
  blocks?: MessageDataBlock[];
  parts?: CherryMessagePart[];
}

export interface CherryUIMessageMetadata {
  completionTokens?: number;
  createdAt?: string;
  modelId?: string;
  modelSnapshot?: ModelSnapshot;
  parentId?: string | null;
  promptTokens?: number;
  siblingsGroupId?: number;
  stats?: MessageStats;
  status?: MessageStatus;
  thoughtsTokens?: number;
  totalTokens?: number;
}

export type CherryUIMessage = UIMessage<CherryUIMessageMetadata, CherryDataPartTypes>;
export type CherryUIMessageChunk = InferUIMessageChunk<CherryUIMessage>;

export type {
  DataUIPart,
  DynamicToolUIPart,
  FileUIPart,
  ReasoningUIPart,
  TextUIPart,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
};

export enum ReferenceCategory {
  CITATION = 'citation',
  MENTION = 'mention',
}

export enum CitationType {
  KNOWLEDGE = 'knowledge',
  MEMORY = 'memory',
  WEB = 'web',
}

export interface BaseReference {
  category: ReferenceCategory;
  marker?: string;
  range?: { end: number; start: number };
}

interface BaseCitationReference extends BaseReference {
  category: ReferenceCategory.CITATION;
  citationType: CitationType;
}

export interface WebCitationReference extends BaseCitationReference {
  citationType: CitationType.WEB;
  content: {
    results?: unknown;
    source: unknown;
  };
}

export interface KnowledgeCitationReference extends BaseCitationReference {
  citationType: CitationType.KNOWLEDGE;
  content: {
    content: string;
    file?: unknown;
    id: number;
    metadata?: Record<string, unknown>;
    sourceUrl: string;
    type: string;
  }[];
}

export interface MemoryCitationReference extends BaseCitationReference {
  citationType: CitationType.MEMORY;
  content: {
    createdAt?: string;
    hash?: string;
    id: string;
    memory: string;
    metadata?: Record<string, unknown>;
    score?: number;
    updatedAt?: string;
  }[];
}

export type CitationReference =
  | KnowledgeCitationReference
  | MemoryCitationReference
  | WebCitationReference;

export interface MentionReference extends BaseReference {
  category: ReferenceCategory.MENTION;
  displayName?: string;
  modelId: string;
}

export type ContentReference = CitationReference | MentionReference;

export function isCitation(ref: ContentReference): ref is CitationReference {
  return ref.category === ReferenceCategory.CITATION;
}

export function isMention(ref: ContentReference): ref is MentionReference {
  return ref.category === ReferenceCategory.MENTION;
}

export function isWebCitation(ref: ContentReference): ref is WebCitationReference {
  return isCitation(ref) && ref.citationType === CitationType.WEB;
}

export function isKnowledgeCitation(ref: ContentReference): ref is KnowledgeCitationReference {
  return isCitation(ref) && ref.citationType === CitationType.KNOWLEDGE;
}

export function isMemoryCitation(ref: ContentReference): ref is MemoryCitationReference {
  return isCitation(ref) && ref.citationType === CitationType.MEMORY;
}

export enum BlockType {
  CITATION = 'citation',
  CODE = 'code',
  COMPACT = 'compact',
  ERROR = 'error',
  FILE = 'file',
  IMAGE = 'image',
  MAIN_TEXT = 'main_text',
  THINKING = 'thinking',
  TOOL = 'tool',
  TRANSLATION = 'translation',
  UNKNOWN = 'unknown',
  VIDEO = 'video',
}

export interface BaseBlock {
  createdAt: number;
  error?: SerializedErrorData;
  metadata?: Record<string, unknown>;
  type: BlockType;
  updatedAt?: number;
}

export interface SerializedErrorData {
  cause?: unknown;
  code?: string;
  message: string;
  name?: string;
  stack?: string;
}

export interface UnknownBlock extends BaseBlock {
  content?: string;
  type: BlockType.UNKNOWN;
}

export interface MainTextBlock extends BaseBlock {
  content: string;
  references?: ContentReference[];
  type: BlockType.MAIN_TEXT;
}

export interface ThinkingBlock extends BaseBlock {
  content: string;
  thinkingMs: number;
  type: BlockType.THINKING;
}

export interface TranslationBlock extends BaseBlock {
  content: string;
  sourceBlockId?: string;
  sourceLanguage?: string;
  targetLanguage: string;
  type: BlockType.TRANSLATION;
}

export interface CodeBlock extends BaseBlock {
  content: string;
  language: string;
  type: BlockType.CODE;
}

export interface ImageBlock extends BaseBlock {
  fileId?: string;
  type: BlockType.IMAGE;
  url?: string;
}

export interface ToolBlock extends BaseBlock {
  arguments?: Record<string, unknown>;
  content?: object | string;
  toolId: string;
  toolName?: string;
  type: BlockType.TOOL;
}

/** @deprecated Citation data is represented by parts/provider metadata in new mobile data. */
export interface CitationBlock extends BaseBlock {
  knowledgeData?: unknown;
  memoriesData?: unknown;
  responseData?: unknown;
  type: BlockType.CITATION;
}

export interface FileBlock extends BaseBlock {
  fileId: string;
  type: BlockType.FILE;
}

export interface VideoBlock extends BaseBlock {
  filePath?: string;
  type: BlockType.VIDEO;
  url?: string;
}

export interface ErrorBlock extends BaseBlock {
  type: BlockType.ERROR;
}

export interface CompactBlock extends BaseBlock {
  compactedContent: string;
  content: string;
  type: BlockType.COMPACT;
}

export type MessageDataBlock =
  | CitationBlock
  | CodeBlock
  | CompactBlock
  | ErrorBlock
  | FileBlock
  | ImageBlock
  | MainTextBlock
  | ThinkingBlock
  | ToolBlock
  | TranslationBlock
  | UnknownBlock
  | VideoBlock;

export const MessageDataSchema = z.custom<MessageData>((value) => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as MessageData;
  if (data.blocks !== undefined && !Array.isArray(data.blocks)) {
    return false;
  }
  if (data.parts !== undefined && !Array.isArray(data.parts)) {
    return false;
  }

  return true;
});

export const ModelSnapshotSchema = z.strictObject({
  group: z.string().optional(),
  id: z.string(),
  name: z.string(),
  provider: z.string(),
});
export type ModelSnapshot = z.infer<typeof ModelSnapshotSchema>;

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageStatusSchema = z.enum(['pending', 'success', 'error', 'paused']);
export type MessageStatus = z.infer<typeof MessageStatusSchema>;

export const MessageSchema = z.strictObject({
  createdAt: z.iso.datetime(),
  data: MessageDataSchema,
  id: z.string(),
  modelId: z.string().nullable().optional(),
  modelSnapshot: ModelSnapshotSchema.nullable().optional(),
  parentId: z.string().nullable(),
  role: MessageRoleSchema,
  searchableText: z.string(),
  siblingsGroupId: z.number(),
  stats: MessageStatsSchema.nullable().optional(),
  status: MessageStatusSchema,
  topicId: z.string(),
  traceId: z.string().nullable().optional(),
  updatedAt: z.iso.datetime(),
});
export type Message = z.infer<typeof MessageSchema>;

export const CreateMessageSchema = z.strictObject({
  data: MessageDataSchema,
  modelId: z.string().optional(),
  modelSnapshot: ModelSnapshotSchema.optional(),
  parentId: z.string().nullable().optional(),
  role: MessageRoleSchema,
  setAsActive: z.boolean().optional(),
  siblingsGroupId: z.number().optional(),
  stats: MessageStatsSchema.optional(),
  status: MessageStatusSchema.optional(),
  traceId: z.string().optional(),
});
export type CreateMessageDto = z.infer<typeof CreateMessageSchema>;

export const UpdateMessageSchema = z.strictObject({
  data: MessageDataSchema.optional(),
  parentId: z.string().nullable().optional(),
  siblingsGroupId: z.number().optional(),
  stats: MessageStatsSchema.nullable().optional(),
  status: MessageStatusSchema.optional(),
  traceId: z.string().nullable().optional(),
});
export type UpdateMessageDto = z.infer<typeof UpdateMessageSchema>;

export const ActiveNodeStrategySchema = z.enum(['parent', 'clear']);
export type ActiveNodeStrategy = z.infer<typeof ActiveNodeStrategySchema>;

export interface DeleteMessageResponse {
  deletedIds: string[];
  newActiveNodeId?: string | null;
  reparentedIds?: string[];
}

export interface TreeNode {
  createdAt: string;
  hasChildren: boolean;
  id: string;
  modelId?: string | null;
  parentId?: string | null;
  preview: string;
  role: MessageRole;
  status: MessageStatus;
}

export interface SiblingsGroup {
  nodes: Omit<TreeNode, 'parentId'>[];
  parentId: string;
  siblingsGroupId: number;
}

export interface TreeResponse {
  activeNodeId: string | null;
  nodes: TreeNode[];
  siblingsGroups: SiblingsGroup[];
}

export interface BranchMessage {
  message: Message;
  siblingsGroup?: Message[];
}

export interface BranchMessagesResponse extends CursorPaginationResponse<BranchMessage> {
  activeNodeId: string | null;
  assistantId: string | null;
}
