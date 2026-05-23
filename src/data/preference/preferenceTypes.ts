import type { PreferenceSchemas } from './preferenceSchemas';

/** DB-backed preferences only (stored in SQLite). */
export type PreferenceDefaultScopeType = PreferenceSchemas['default'];
export type PreferenceKeyType = keyof PreferenceDefaultScopeType;

/** Unified type: mobile currently stores all supported preferences in SQLite. */
export type UnifiedPreferenceType = PreferenceDefaultScopeType;
export type UnifiedPreferenceKeyType = keyof UnifiedPreferenceType;

/**
 * Result type for getMultipleRaw - maps requested keys to their values.
 */
export type UnifiedPreferenceMultipleResultType<K extends UnifiedPreferenceKeyType> = {
  [P in K]: UnifiedPreferenceType[P];
};

export type PreferenceUpdateOptions = {
  optimistic: boolean;
};

export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

/** Limited UI languages. */
export type LanguageVarious =
  | 'zh-CN'
  | 'zh-TW'
  | 'de-DE'
  | 'el-GR'
  | 'en-US'
  | 'es-ES'
  | 'fr-FR'
  | 'ja-JP'
  | 'pt-PT'
  | 'ro-RO'
  | 'ru-RU'
  | 'vi-VN';

export const WEB_SEARCH_PROVIDER_TYPES = ['api', 'mcp'] as const;

export type WebSearchProviderType = (typeof WEB_SEARCH_PROVIDER_TYPES)[number];

export const WEB_SEARCH_PROVIDER_IDS = [
  'zhipu',
  'tavily',
  'searxng',
  'exa',
  'exa-mcp',
  'bocha',
  'querit',
  'fetch',
  'jina',
] as const;

export type WebSearchProviderId = (typeof WEB_SEARCH_PROVIDER_IDS)[number];

export const WEB_SEARCH_CAPABILITIES = ['searchKeywords', 'fetchUrls'] as const;

export type WebSearchCapability = (typeof WEB_SEARCH_CAPABILITIES)[number];

export type WebSearchProviderCapabilityOverride = {
  apiHost?: string;
};

export type WebSearchProviderCapabilityOverrides = Partial<
  Record<WebSearchCapability, WebSearchProviderCapabilityOverride>
>;

export type WebSearchProviderOverride = {
  apiKeys?: string[];
  basicAuthPassword?: string;
  basicAuthUsername?: string;
  capabilities?: WebSearchProviderCapabilityOverrides;
  engines?: string[];
};

export type WebSearchProviderOverrides = Partial<
  Record<WebSearchProviderId, WebSearchProviderOverride>
>;

export interface WebSearchProvider {
  apiKeys: string[];
  basicAuthPassword: string;
  basicAuthUsername: string;
  capabilities: {
    apiHost?: string;
    feature: WebSearchCapability;
  }[];
  engines: string[];
  id: WebSearchProviderId;
  name: string;
  type: WebSearchProviderType;
}

export type WebSearchCompressionMethod = 'none' | 'cutoff';
