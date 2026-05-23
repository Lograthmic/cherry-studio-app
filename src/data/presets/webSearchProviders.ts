import type {
  WebSearchCapability,
  WebSearchProviderId,
  WebSearchProviderType,
} from '@/data/preference';
import { WEB_SEARCH_PROVIDER_IDS } from '@/data/preference';

type WebSearchProviderPresetCapability = {
  apiHost?: string;
  feature: WebSearchCapability;
};

type WebSearchProviderPresetConfig = {
  capabilities: readonly WebSearchProviderPresetCapability[];
  name: string;
  type: WebSearchProviderType;
};

export interface WebSearchProviderPreset extends WebSearchProviderPresetConfig {
  id: WebSearchProviderId;
}

export const WEB_SEARCH_PROVIDER_PRESET_MAP = {
  zhipu: {
    name: 'Zhipu',
    type: 'api',
    capabilities: [
      { feature: 'searchKeywords', apiHost: 'https://open.bigmodel.cn/api/paas/v4/web_search' },
    ],
  },
  tavily: {
    name: 'Tavily',
    type: 'api',
    capabilities: [{ feature: 'searchKeywords', apiHost: 'https://api.tavily.com' }],
  },
  searxng: {
    name: 'Searxng',
    type: 'api',
    capabilities: [{ feature: 'searchKeywords', apiHost: 'http://localhost:8080' }],
  },
  exa: {
    name: 'Exa',
    type: 'api',
    capabilities: [{ feature: 'searchKeywords', apiHost: 'https://api.exa.ai' }],
  },
  'exa-mcp': {
    name: 'ExaMCP',
    type: 'mcp',
    capabilities: [{ feature: 'searchKeywords', apiHost: 'https://mcp.exa.ai/mcp' }],
  },
  bocha: {
    name: 'Bocha',
    type: 'api',
    capabilities: [{ feature: 'searchKeywords', apiHost: 'https://api.bochaai.com' }],
  },
  querit: {
    name: 'Querit',
    type: 'api',
    capabilities: [{ feature: 'searchKeywords', apiHost: 'https://api.querit.ai' }],
  },
  fetch: {
    name: 'fetch',
    type: 'api',
    capabilities: [{ feature: 'fetchUrls' }],
  },
  jina: {
    name: 'Jina',
    type: 'api',
    capabilities: [
      { feature: 'searchKeywords', apiHost: 'https://s.jina.ai' },
      { feature: 'fetchUrls', apiHost: 'https://r.jina.ai' },
    ],
  },
} as const satisfies Record<WebSearchProviderId, WebSearchProviderPresetConfig>;

export const PRESETS_WEB_SEARCH_PROVIDERS: readonly WebSearchProviderPreset[] =
  WEB_SEARCH_PROVIDER_IDS.map((id) => ({
    id,
    ...WEB_SEARCH_PROVIDER_PRESET_MAP[id],
  }));

export function getWebSearchProvidersByCapability(capability: WebSearchCapability) {
  return PRESETS_WEB_SEARCH_PROVIDERS.filter((provider) =>
    provider.capabilities.some((item) => item.feature === capability),
  );
}
