import { MODEL_ICON_CATALOG, type ModelIconKey } from './models/catalog';
import type { CompoundIcon } from './types';

const MODEL_ICON_PATTERNS: readonly [RegExp, string][] = [
  [/gpt-5\.1-codex-mini/i, 'gpt51CodexMini'],
  [/gpt-5\.1-codex/i, 'gpt51Codex'],
  [/gpt-5\.1-chat/i, 'gpt51Chat'],
  [/gpt-5\.1/i, 'gpt51'],
  [/gpt-5\.2-pro/i, 'gpt52Pro'],
  [/gpt-5\.2/i, 'gpt52'],
  [/gpt-5-mini/i, 'gpt5Mini'],
  [/gpt-5-nano/i, 'gpt5Nano'],
  [/gpt-5-chat/i, 'gpt5Chat'],
  [/gpt-5-codex/i, 'gpt5Codex'],
  [/gpt-5/i, 'gpt5'],
  [/gpt-oss-120b/i, 'gptOss120b'],
  [/gpt-oss-20b/i, 'gptOss20b'],
  [/gpt-image-1\.5/i, 'gptImage15'],
  [/gpt-image/i, 'gptImage1'],
  [/(sora-|sora_)/i, 'sora'],
  [/(claude|anthropic-)/i, 'claude'],
  [/gemini|veo|imagen|nano-banana/i, 'gemini'],
  [/gemma/i, 'gemma'],
  [/(qwen|qwq|qvq|wan|z-image)/i, 'qwen'],
  [/glm/i, 'glm'],
  [/doubao|seedream|seedance|seed-oss|ep-202/i, 'doubao'],
  [/hunyuan/i, 'hunyuan'],
  [/kimi|moonshot/i, 'kimi'],
  [/grok/i, 'grok'],
  [/hailuo/i, 'hailuo'],
  [/codegeex/i, 'codegeex'],
  [/mimo/i, 'mimo'],
  [/palm|bison/i, 'palm'],
  [/ibm/i, 'ibm'],
  [/aya/i, 'aya'],
  [/trinity/i, 'trinity'],
  [/nova/i, 'nova'],
  [/ling|ring/i, 'ling'],
  [/sensenova/i, 'sensenova'],
];

export function resolveModelIcon(modelId: string): CompoundIcon | undefined {
  if (!modelId) return undefined;

  for (const [regex, catalogKey] of MODEL_ICON_PATTERNS) {
    if (regex.test(modelId)) {
      return MODEL_ICON_CATALOG[catalogKey as ModelIconKey];
    }
  }

  return undefined;
}
