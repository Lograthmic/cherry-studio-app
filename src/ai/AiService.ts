import { generateImage as aiCoreGenerateImage } from '@cherrystudio/ai-core';
import { type LanguageModelUsage, type ModelMessage, type UIMessageChunk } from 'ai';
import type { AssistantService } from '@/data/services/AssistantService';
import type { ModelService } from '@/data/services/ModelService';
import type { ProviderService } from '@/data/services/ProviderService';
import type { Assistant } from '@/data/types/assistant';
import type { Model } from '@/data/types/model';
import { parseUniqueModelId } from '@/data/types/model';
import type { Provider } from '@/data/types/provider';

import { resolveUIMessageFileUrls } from './messages/messageConverter';
import { providerToAiSdkConfig } from './provider/config';
import { listModels as listProviderModels } from './provider/listModels';
import { Agent } from './runtime/aiSdk/Agent';
import type { AppProviderSettingsMap } from './types';
import type { AiBaseRequest, AiStreamRequest, ListModelsRequest } from './types/requests';
import { getMaxTokens, getTemperature, getTimeout, getTopP } from './utils/modelParameters';
import {
  buildCapabilityProviderOptions,
  extractAiSdkStandardParams,
  mergeCustomProviderParameters,
} from './utils/options';

// ── Request types ──────────────────────────────────────────────────

/** Non-streaming text generation request — pure transport data. */
export interface AiGenerateRequest extends AiBaseRequest {
  system?: string;
  prompt?: string;
  messages?: ModelMessage[];
}

// ── SDK extensions ─────────────────────────────────────────────────

/** Result of non-streaming text generation. */
export interface AiGenerateResult {
  text: string;
  usage?: LanguageModelUsage;
}

export interface AiImageRequest extends AiBaseRequest {
  prompt: string;
  n?: number;
  size?: `${number}x${number}`;
  aspectRatio?: `${number}:${number}`;
  seed?: number;
}

export interface AiImageResult {
  images: Array<{
    base64: string;
    mediaType: string;
  }>;
  usage?: unknown;
}

export interface AiServiceDependencies {
  assistant: AssistantService;
  model: ModelService;
  provider: ProviderService;
}

/**
 * Lifecycle AI service. See `docs/references/ai/core-architecture.md` in desktop.
 *
 * Mobile keeps the desktop service name but does not register IPC handlers
 * or depend on Electron main-process lifecycle services.
 */
export class AiService {
  constructor(private readonly services: AiServiceDependencies) {}

  // ── Streaming chat (agent.stream) ──

  /**
   * Raw `UIMessageChunk` stream from `Agent.stream`. Caller owns
   * read/multicast/accumulation/terminal dispatch.
   * Pre-stream errors reject the Promise; mid-stream errors come through
   * the stream itself.
   */
  async streamText(request: AiStreamRequest): Promise<ReadableStream<UIMessageChunk>> {
    const signal = request.requestOptions?.signal;
    if (!signal) {
      throw new Error(
        'streamText requires requestOptions.signal — no AbortController was attached by the caller',
      );
    }

    const { sdkConfig, system, options } = await this.buildAgentParamsFor(request);
    const preparedMessages = await resolveUIMessageFileUrls(request.messages ?? []);

    const agent = new Agent({
      providerId: sdkConfig.providerId,
      providerSettings: sdkConfig.providerSettings,
      modelId: sdkConfig.modelId,
      messageId: request.messageId,
      plugins: [],
      system,
      options,
    });

    return agent.stream(preparedMessages, signal);
  }

  // ── Non-streaming text generation (agent.generate) ──

  async generateText(request: AiGenerateRequest): Promise<AiGenerateResult> {
    const signal = request.requestOptions?.signal;

    const { sdkConfig, system, options } = await this.buildAgentParamsFor(request);

    const agent = new Agent({
      providerId: sdkConfig.providerId,
      providerSettings: sdkConfig.providerSettings,
      modelId: sdkConfig.modelId,
      plugins: [],
      system: request.system ?? system,
      options,
    });

    // prompt and messages are mutually exclusive in AI SDK; preserve that.
    return agent.generate(
      request.prompt ? { prompt: request.prompt } : { messages: request.messages ?? [] },
      signal,
    );
  }

  // ── Model listing ──

  async listModels(request: ListModelsRequest): Promise<Partial<Model>[]> {
    const provider = await this.getProviderForListModels(request);
    return listProviderModels(
      provider,
      {
        getRotatedApiKey: (providerId) => this.services.provider.getRotatedApiKey(providerId),
      },
      request.requestOptions?.signal,
      { throwOnError: request.throwOnError },
    );
  }

  // ── Image generation ──

  async generateImage(request: AiImageRequest): Promise<AiImageResult> {
    const signal = request.requestOptions?.signal;
    const { sdkConfig, model, assistant, options } = await this.buildAgentParamsFor(request);
    const customParams = assistant ? getCustomParameters(assistant) : {};
    const split = extractAiSdkStandardParams(customParams);

    const result = await aiCoreGenerateImage<AppProviderSettingsMap>(
      sdkConfig.providerId,
      sdkConfig.providerSettings as never,
      {
        model: model.modelId,
        prompt: request.prompt,
        n: request.n,
        size: request.size,
        aspectRatio: request.aspectRatio,
        seed: request.seed,
        maxRetries: request.requestOptions?.maxRetries ?? 0,
        abortSignal: signal,
        ...(options.providerOptions && { providerOptions: options.providerOptions }),
        ...(request.requestOptions?.headers && {
          headers: stripUndefinedHeaders(request.requestOptions.headers),
        }),
        ...split.standardParams,
      },
    );

    return {
      images: result.images.map((image) => ({
        base64: image.base64,
        mediaType: image.mediaType,
      })),
      usage: result.usage,
    };
  }

  // ── API validation ──

  /** Dispatches to `generateText` for the first mobile AI migration slice. */
  async checkModel(request: AiBaseRequest & { timeout?: number }): Promise<{ latency: number }> {
    const start = performance.now();
    const timeout = request.timeout ?? 15000;

    // AbortController on timeout so the HTTP work cancels too (otherwise tokens keep burning).
    const controller = new AbortController();
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        controller.abort(new Error('Check model timeout'));
        reject(new Error('Check model timeout'));
      }, timeout);
    });

    const probeRequest = {
      ...request,
      requestOptions: { ...request.requestOptions, signal: controller.signal },
    };
    const probe = this.generateText({ ...probeRequest, system: 'test', prompt: 'hi' });

    try {
      await Promise.race([probe, timeoutPromise]);
      return { latency: performance.now() - start };
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  }

  // ── Shared agent parameter resolution ──

  private async buildAgentParamsFor(request: AiBaseRequest & { chatId?: string }) {
    const { provider, model, assistant } = await this.getProviderAndModel(request);
    const sdkConfig = await providerToAiSdkConfig(provider, model, {
      getRotatedApiKey: (providerId) => this.services.provider.getRotatedApiKey(providerId),
      getAuthConfig: (providerId) => this.services.provider.getAuthConfig(providerId),
    });
    const capabilities = assistant ? resolveCapabilities(model, assistant) : undefined;
    const providerOptions =
      assistant && capabilities
        ? buildCapabilityProviderOptions(assistant, model, provider, capabilities)
        : {};
    const standardParams = assistant
      ? this.getAssistantStandardParams(assistant, model, provider)
      : {};
    const customParams = assistant ? getCustomParameters(assistant) : {};
    const split = extractAiSdkStandardParams(customParams);
    const mergedProviderOptions = mergeCustomProviderParameters(
      providerOptions,
      split.providerParams,
      sdkConfig.providerId,
    );

    return {
      sdkConfig: {
        ...sdkConfig,
        modelId: model.modelId,
      },
      provider,
      model,
      assistant,
      system: assistant?.prompt,
      options: {
        maxRetries: request.requestOptions?.maxRetries ?? 0,
        timeout: request.requestOptions?.timeout ?? getTimeout(model),
        ...(request.requestOptions?.headers && { headers: request.requestOptions.headers }),
        ...(Object.keys(mergedProviderOptions).length > 0 && {
          providerOptions: mergedProviderOptions,
        }),
        ...standardParams,
        ...split.standardParams,
      },
    };
  }

  private getAssistantStandardParams(assistant: Assistant, model: Model, provider: Provider) {
    const params: Record<string, number> = {};
    const temperature = getTemperature(assistant, model);
    const topP = getTopP(assistant, model);
    const maxOutputTokens = getMaxTokens(assistant, model, provider);

    if (temperature !== undefined) params.temperature = temperature;
    if (topP !== undefined) params.topP = topP;
    if (maxOutputTokens !== undefined) params.maxOutputTokens = maxOutputTokens;

    return params;
  }

  /** Priority: explicit `uniqueModelId` > `assistant.modelId`. */
  private async getProviderAndModel(request: AiBaseRequest & { chatId?: string }) {
    let assistant: Assistant | undefined;
    if (request.assistantId) {
      assistant = await this.services.assistant.getById(request.assistantId).catch(() => undefined);
    }

    let providerId: string | undefined;
    let modelId: string | undefined;
    if (request.uniqueModelId) {
      const parsed = parseUniqueModelId(request.uniqueModelId);
      providerId = parsed.providerId;
      modelId = parsed.modelId;
    } else if (assistant?.modelId) {
      const parsed = parseUniqueModelId(assistant.modelId);
      providerId = parsed.providerId;
      modelId = parsed.modelId;
    }
    if (!providerId)
      throw new Error('Cannot resolve providerId: not in request and assistant has no model');
    if (!modelId)
      throw new Error('Cannot resolve modelId: not in request and assistant has no model');

    const provider = await this.services.provider.getByProviderId(providerId);
    const model = await this.services.model.getById(`${providerId}::${modelId}`);
    if (!model) {
      throw new Error(`Cannot resolve model: ${providerId}::${modelId}`);
    }

    return { provider, model, assistant };
  }

  private async getProviderForListModels(request: ListModelsRequest): Promise<Provider> {
    if (request.providerId) {
      return this.services.provider.getByProviderId(request.providerId);
    }

    if (!request.assistantId) {
      throw new Error('listModels requires providerId or assistantId');
    }

    const assistant = await this.services.assistant.getById(request.assistantId);
    if (!assistant.modelId) {
      throw new Error('Cannot resolve providerId: assistant has no model');
    }

    const { providerId } = parseUniqueModelId(assistant.modelId);
    return this.services.provider.getByProviderId(providerId);
  }
}

function resolveCapabilities(model: Model, assistant: Assistant) {
  const enableReasoning = Boolean(
    model.reasoning && assistant.settings?.reasoning_effort !== undefined,
  );
  const enableWebSearch = Boolean(
    assistant.settings?.enableWebSearch && model.capabilities.includes('web-search'),
  );
  const enableGenerateImage = model.capabilities.includes('image-generation');

  return {
    enableReasoning,
    enableWebSearch,
    enableUrlContext: false,
    enableGenerateImage,
  };
}

function getCustomParameters(assistant: Assistant): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const item of assistant.settings?.customParameters ?? []) {
    params[item.name] = item.value;
  }
  return params;
}

function stripUndefinedHeaders(
  headers: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}
