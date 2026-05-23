/**
 * Preferences configuration.
 *
 * ## Key Naming Convention
 *
 * All preference keys MUST follow the format: `namespace.sub.key_name`.
 *
 * Rules:
 * - At least 2 segments separated by dots (.).
 * - Each segment uses lowercase letters, numbers, and underscores only.
 * - Pattern: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.
 */

import {
  type LanguageVarious,
  ThemeMode,
  type WebSearchCompressionMethod,
  type WebSearchProviderId,
  type WebSearchProviderOverrides,
} from './preferenceTypes';

export type PreferenceSchemas = {
  default: {
    'app.language': LanguageVarious | null;
    'app.user.id': string;
    'app.user.name': string;
    'chat.default_model_id': string | null;
    'chat.web_search.compression.cutoff_limit': number;
    'chat.web_search.compression.method': WebSearchCompressionMethod;
    'chat.web_search.default_fetch_urls_provider': WebSearchProviderId | null;
    'chat.web_search.default_search_keywords_provider': WebSearchProviderId | null;
    'chat.web_search.exclude_domains': string[];
    'chat.web_search.max_results': number;
    'chat.web_search.provider_overrides': WebSearchProviderOverrides;
    'feature.quick_assistant.model_id': string | null;
    'feature.translate.model_id': string | null;
    'ui.theme_mode': ThemeMode;
  };
};

export const DefaultPreferences = {
  default: {
    'app.language': null,
    'app.user.id': 'uuid()',
    'app.user.name': '',
    'chat.default_model_id': null,
    'chat.web_search.compression.cutoff_limit': 2000,
    'chat.web_search.compression.method': 'none',
    'chat.web_search.default_fetch_urls_provider': null,
    'chat.web_search.default_search_keywords_provider': null,
    'chat.web_search.exclude_domains': [],
    'chat.web_search.max_results': 5,
    'chat.web_search.provider_overrides': {},
    'feature.quick_assistant.model_id': null,
    'feature.translate.model_id': null,
    'ui.theme_mode': ThemeMode.system,
  },
} as const satisfies PreferenceSchemas;
