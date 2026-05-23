type Serializable =
  | null
  | boolean
  | number
  | string
  | Serializable[]
  | { [key: string]: Serializable };

type SerializedError = {
  message: string | null;
  name: string | null;
  stack: string | null;
  [key: string]: Serializable;
};

export type ErrorPartData = Partial<SerializedError> & {
  code?: string;
  message?: string | null;
  name?: string | null;
  stack?: string | null;
};

export interface TranslationPartData {
  content: string;
  targetLanguage: string;
  sourceLanguage?: string;
  sourceBlockId?: string;
}

export interface VideoPartData {
  url?: string;
  filePath?: string;
}

export interface CompactPartData {
  content: string;
  compactedContent: string;
}

export interface CodePartData {
  content: string;
  language: string;
}

export type CherryDataPartTypes = {
  code: CodePartData;
  compact: CompactPartData;
  error: ErrorPartData;
  translation: TranslationPartData;
  video: VideoPartData;
};

export interface CherryProviderMetadata {
  createdAt?: number;
  error?: {
    message: string;
    name?: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
  references?: unknown[];
  thinkingMs?: number;
  updatedAt?: number;
}
