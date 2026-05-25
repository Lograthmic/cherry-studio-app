/**
 * Anthropic beta-header resolution.
 *
 * Returns the `anthropic-beta` flag names a request should include based on
 * `(assistant, model, provider)`. Consumed by provider option builders.
 *
 * Ported from renderer origin/main `aiCore/prepareParams/header.ts`.
 */

import type { Assistant } from '@/data/types/assistant';
import type { Model } from '@/data/types/model';
import type { Provider } from '@/data/types/provider';

export function addAnthropicHeaders(
  _assistant: Assistant,
  _model: Model,
  _provider?: Provider,
): string[] {
  return [];
}
