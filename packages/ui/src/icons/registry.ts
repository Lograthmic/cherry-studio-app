import { resolveGeneralIcon } from '../icons-png/general';
import { MODEL_ID_ALIASES } from '../icons-png/model-aliases';
import { MODEL_ICONS, type ModelIconKey, resolveModelAssetIcon } from '../icons-png/models';
import { PROVIDER_ID_ALIASES } from '../icons-png/provider-aliases';
import { resolveProviderAssetIcon } from '../icons-png/providers';
import type { IconPngSource } from './types';

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
  [/gemini|veo|imagen/i, 'gemini'],
  [/gemma/i, 'gemma'],
  [/(qwen|qwq|qvq|wan-)/i, 'qwen'],
  [/glm/i, 'glm'],
  [/doubao|seedream|seedance|ep-202/i, 'doubao'],
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

const MODEL_TO_PROVIDER_ICON_PATTERNS: readonly [RegExp, string][] = [
  [
    /gpt-5|gpt-4|gpt-3|o1-|o3-|o4-|chatgpt|dall-e|whisper|tts-|text-embedding-ada|text-embedding-3|babbage|davinci/i,
    'openai',
  ],
  [/palm|veo|imagen|learnlm|text-embedding-00|text-multilingual-embedding-00/i, 'google'],
  [/llama|meta-/i, 'meta'],
  [/deepseek/i, 'deepseek'],
  [/mistral|pixtral|codestral|ministral|voxtral|devstral|mixtral|magistral/i, 'mistral'],
  [/command-r|command-a|c4ai-|cohere|embed-|rerank-/i, 'cohere'],
  [/nemotron|nvidia/i, 'nvidia'],
  [/phi-|orca|wizardlm|microsoft/i, 'azureai'],
  [/inflection/i, 'inflection'],
  [/nous-|hermes|deephermes/i, 'nousresearch'],
  [/dbrx/i, 'databricks'],
  [/olmo|molmo|tulu/i, 'allenai'],
  [/pplx-|sonar/i, 'perplexity'],
  [/moonshot/i, 'moonshot'],
  [/chatglm|cogview|cogvideo/i, 'zhipu'],
  [/minimax|abab/i, 'minimax'],
  [/baichuan/i, 'baichuan'],
  [/step-/i, 'step'],
  [/yi-/i, 'zeroOne'],
  [/cerebras/i, 'cerebras'],
  [/huggingface/i, 'huggingface'],
  [/lfm-/i, 'liquid'],
  [/jamba|j2-/i, 'ai21'],
  [/solar/i, 'upstage'],
  [/arcee|spotlight|virtuoso|coder-large/i, 'arceeAi'],
  [/internlm|internvl|intern/i, 'internlm'],
  [/ernie|wenxin/i, 'wenxin'],
  [/skylark|ui-tars/i, 'volcengine'],
  [/voyage/i, 'voyage'],
  [/nomic/i, 'nomic'],
  [/mxbai/i, 'mixedbread'],
  [/jina/i, 'jina'],
  [/flux/i, 'bfl'],
  [/kat/i, 'streamlake'],
  [/dolphin/i, 'dolphinAi'],
  [/eleven/i, 'elevenlabs'],
  [/relace/i, 'relace'],
  [/riverflow/i, 'riverflow'],
  [/kling/i, 'kling'],
  [/suno/i, 'suno'],
  [/megrez/i, 'infini'],
  [/aion/i, 'aionlabs'],
  [/mercury/i, 'inceptionlabs'],
  [/longcat/i, 'longcat'],
  [/kwaipilot/i, 'kwaipilot'],
  [/bce/i, 'neteaseYoudao'],
  [/bge/i, 'baai'],
  [/cogito/i, 'deepcogito'],
  [/ideogram/i, 'ideogram'],
  [/recraft/i, 'recraft'],
  [/runway/i, 'runaway'],
  [/stable-|sd3|sdxl/i, 'stability'],
  [/tng-/i, 'tng'],
];

export { resolveGeneralIcon };

export function resolveModelIcon(modelId: string): IconPngSource | undefined {
  if (!modelId) return undefined;

  for (const [regex, catalogKey] of MODEL_ICON_PATTERNS) {
    if (regex.test(modelId)) {
      const key = (MODEL_ID_ALIASES[catalogKey] ?? catalogKey) as ModelIconKey;

      return MODEL_ICONS[key] ?? resolveModelAssetIcon(catalogKey);
    }
  }

  return undefined;
}

export function resolveModelToProviderIcon(modelId: string): IconPngSource | undefined {
  if (!modelId) return undefined;

  for (const [regex, providerId] of MODEL_TO_PROVIDER_ICON_PATTERNS) {
    if (regex.test(modelId)) {
      return resolveProviderIcon(providerId);
    }
  }

  return undefined;
}

export function resolveProviderIcon(providerId: string): IconPngSource | undefined {
  if (!providerId) return undefined;

  const key = PROVIDER_ID_ALIASES[providerId] ?? providerId;

  return resolveProviderAssetIcon(providerId) ?? resolveModelAssetIcon(key);
}

export function resolveModelProviderIcon(
  modelId: string,
  providerId: string,
): IconPngSource | undefined {
  return resolveModelToProviderIcon(modelId) ?? resolveProviderIcon(providerId);
}

export function resolveIcon(modelId: string, providerId: string): IconPngSource | undefined {
  return (
    resolveModelIcon(modelId) ??
    resolveModelToProviderIcon(modelId) ??
    resolveProviderIcon(providerId)
  );
}
