import { ENDPOINT_TYPE } from '@cherrystudio/provider-registry';
import type { Model } from '@/data/types/model';

export function buildProviderBuiltinWebSearchConfig(
  _providerId: string,
  _webSearchConfig: Record<string, unknown>,
  _model: Model,
) {
  return undefined;
}

export function getWebSearchParams(model: Model): Record<string, unknown> {
  if (model.providerId === 'hunyuan') {
    return { enable_enhancement: true, citation: true, search_info: true };
  }

  if (model.providerId === 'dashscope') {
    return {
      enable_search: true,
      search_options: {
        forced_search: true,
      },
    };
  }

  if (model.providerId === 'poe') {
    return {
      extra_body: {
        web_search: true,
      },
    };
  }

  if (
    model.endpointTypes?.[0] === ENDPOINT_TYPE.OPENAI_CHAT_COMPLETIONS &&
    model.capabilities.includes('web-search')
  ) {
    return {
      web_search_options: {},
    };
  }

  return {};
}
