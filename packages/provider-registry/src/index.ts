/**
 * Cherry Studio Registry
 * Main entry point for the model and provider registry system
 */

// Shared vendor identity regex, used by shared model helpers.
export { VENDOR_PATTERNS } from './patterns/vendorPatterns';
// Pure lookup and transformation utilities (no fs dependency)
export type { ModelLookupResult, RuntimeEndpointConfig } from './registryUtils';
export {
  buildRuntimeEndpointConfigs,
  lookupRegistryModel,
  lookupRegistryProvider,
} from './registryUtils';
// Enum types (PascalCase, derived from const objects)
export type {
  AnthropicReasoningEffort,
  Currency,
  EndpointType,
  GeminiThinkingLevel,
  Modality,
  ModelCapability,
  OpenAIReasoningEffort,
  ReasoningEffort,
} from './schemas/enums';
// Enums — const objects (SCREAMING_CASE)
export {
  ANTHROPIC_REASONING_EFFORT,
  CURRENCY,
  ENDPOINT_TYPE,
  GEMINI_THINKING_LEVEL,
  MODALITY,
  MODEL_CAPABILITY,
  OPENAI_REASONING_EFFORT,
  objectValues,
  REASONING_EFFORT,
} from './schemas/enums';
// Schema-inferred types (replaces proto types)
export type {
  ModelConfig,
  ModelConfig as ProtoModelConfig,
  ModelPricing,
  ModelPricing as ProtoModelPricing,
  ReasoningSupport as ProtoReasoningSupport,
  ReasoningSupport,
} from './schemas/model';
export type {
  ProviderConfig as ProtoProviderConfig,
  ProviderConfig,
  ProviderReasoningFormat as ProtoProviderReasoningFormat,
  ProviderReasoningFormat,
  RegistryEndpointConfig,
} from './schemas/provider';
export type {
  ProviderModelOverride as ProtoProviderModelOverride,
  ProviderModelOverride,
} from './schemas/providerModels';
// Model ID normalization utilities
export { normalizeModelId } from './utils/normalize';
