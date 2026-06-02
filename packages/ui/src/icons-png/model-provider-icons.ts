import { resolveProviderIcon, type ProviderIconSource } from './providers';

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
  [/yi-/i, 'zero-one'],
  [/cerebras/i, 'cerebras'],
  [/huggingface/i, 'huggingface'],
  [/lfm-/i, 'liquid'],
  [/jamba|j2-/i, 'ai21'],
  [/solar/i, 'upstage'],
  [/arcee|spotlight|virtuoso|coder-large/i, 'arcee-ai'],
  [/internlm|internvl|intern/i, 'internlm'],
  [/ernie|wenxin/i, 'wenxin'],
  [/skylark|ui-tars/i, 'volcengine'],
  [/voyage/i, 'voyage'],
  [/nomic/i, 'nomic'],
  [/mxbai/i, 'mixedbread'],
  [/jina/i, 'jina'],
  [/flux/i, 'bfl'],
  [/kat/i, 'streamlake'],
  [/dolphin/i, 'dolphin-ai'],
  [/eleven/i, 'elevenlabs'],
  [/relace/i, 'relace'],
  [/riverflow/i, 'riverflow'],
  [/kling|kolors/i, 'kling'],
  [/jimeng/i, 'jimeng'],
  [/suno/i, 'suno'],
  [/megrez/i, 'infini'],
  [/aion/i, 'aionlabs'],
  [/mercury/i, 'inceptionlabs'],
  [/longcat/i, 'longcat'],
  [/kwaipilot/i, 'kwaipilot'],
  [/bce/i, 'netease-youdao'],
  [/bge/i, 'baai'],
  [/cogito/i, 'deepcogito'],
  [/ideogram/i, 'ideogram'],
  [/recraft/i, 'recraft'],
  [/runway/i, 'runway'],
  [/stable-|sd3|sdxl/i, 'stability'],
  [/tng-/i, 'tng'],
];

export function resolveModelToProviderIcon(modelId: string): ProviderIconSource | undefined {
  if (!modelId) return undefined;

  for (const [regex, providerId] of MODEL_TO_PROVIDER_ICON_PATTERNS) {
    if (regex.test(modelId)) {
      return resolveProviderIcon(providerId);
    }
  }

  return undefined;
}

export function resolveModelProviderIcon(
  modelId: string,
  providerId: string,
): ProviderIconSource | undefined {
  return resolveModelToProviderIcon(modelId) ?? resolveProviderIcon(providerId);
}
