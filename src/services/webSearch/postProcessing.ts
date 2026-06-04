import type {
  WebSearchCompressionConfig,
  WebSearchExecutionConfig,
  WebSearchResponse,
  WebSearchResult,
} from '@/data/types/webSearch';

export type WebSearchPostProcessingResult = {
  response: WebSearchResponse;
};

export async function postProcessWebSearchResponse(
  response: WebSearchResponse,
  runtimeConfig: WebSearchExecutionConfig,
): Promise<WebSearchPostProcessingResult> {
  if (response.results.length <= 0) {
    return { response };
  }

  if (runtimeConfig.compression.method === 'cutoff') {
    return {
      response: {
        ...response,
        results: applyCutoff(response.results, runtimeConfig.compression),
      },
    };
  }

  return { response };
}

function applyCutoff(
  results: WebSearchResult[],
  config: WebSearchCompressionConfig,
): WebSearchResult[] {
  if (!config.cutoffLimit) {
    return results;
  }

  const perResultLimit = Math.max(1, Math.floor(config.cutoffLimit / results.length));

  return results.map((result) => {
    if (result.content.length <= perResultLimit) {
      return result;
    }

    return {
      ...result,
      content: `${result.content.slice(0, perResultLimit)}...`,
    };
  });
}
