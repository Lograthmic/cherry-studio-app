import { embedMany as aiCoreEmbedMany } from '@cherrystudio/ai-core';
import { ENDPOINT_TYPE, MODEL_CAPABILITY } from '@cherrystudio/provider-registry';
import { AiService, type AiServiceDependencies } from '@/ai/AiService';
import { DEFAULT_ASSISTANT_SETTINGS, type Assistant } from '@/data/types/assistant';
import { createUniqueModelId, type Model } from '@/data/types/model';
import type { Provider } from '@/data/types/provider';

const mockGenerate = jest.fn(async () => ({ text: 'ok', usage: undefined }));
const mockAgentConstructor = jest.fn();

jest.mock('@cherrystudio/ai-core', () => ({
  embedMany: jest.fn(async () => ({ embeddings: [[0.1]], usage: undefined })),
  generateImage: jest.fn(),
}));

jest.mock('@/integration/cherryai', () => ({
  generateSignature: jest.fn(() => ({})),
}));

jest.mock('@/ai/runtime/aiSdk/Agent', () => ({
  Agent: jest.fn().mockImplementation((params) => {
    mockAgentConstructor(params);
    return { generate: mockGenerate };
  }),
}));

const embedManyMock = aiCoreEmbedMany as jest.MockedFunction<typeof aiCoreEmbedMany>;

describe('AiService.checkModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks embedding models with embedMany', async () => {
    const model = createModel('text-embedding-3-small', {
      capabilities: [MODEL_CAPABILITY.EMBEDDING],
      endpointTypes: [ENDPOINT_TYPE.OPENAI_EMBEDDINGS],
    });
    const services = createServices({ model });
    const service = new AiService(services);
    const externalController = new AbortController();

    await service.checkModel({
      apiKeyOverride: 'selected-key',
      requestOptions: {
        headers: { 'X-Check': 'yes', 'X-Empty': undefined },
        maxRetries: 3,
        signal: externalController.signal,
      },
      timeout: 1000,
      uniqueModelId: model.id,
    });

    expect(embedManyMock).toHaveBeenCalledTimes(1);
    expect(embedManyMock).toHaveBeenCalledWith(
      'openai-compatible',
      expect.objectContaining({
        apiKey: 'selected-key',
        baseURL: 'https://api.example.com/v1',
      }),
      expect.objectContaining({
        abortSignal: expect.any(AbortSignal),
        headers: { 'X-Check': 'yes' },
        maxRetries: 3,
        model: model.modelId,
        values: ['test'],
      }),
    );
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(services.provider.getRotatedApiKey).not.toHaveBeenCalled();
  });

  it('keeps provider options when checking embedding models through an assistant', async () => {
    const model = createModel('text-embedding-3-small', {
      capabilities: [MODEL_CAPABILITY.EMBEDDING],
      endpointTypes: [ENDPOINT_TYPE.OPENAI_EMBEDDINGS],
    });
    const assistant = createAssistant(model.id);
    const service = new AiService(createServices({ assistant, model }));

    await service.checkModel({
      assistantId: assistant.id,
      requestOptions: { maxRetries: 1 },
      timeout: 1000,
    });

    expect(embedManyMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.anything(),
      expect.objectContaining({
        maxRetries: 1,
        providerOptions: {
          'openai-compatible': {
            customFlag: true,
            reasoningEffort: 'low',
          },
        },
      }),
    );
  });

  it('checks non-embedding models with generateText probe', async () => {
    const model = createModel('gpt-4o-mini');
    const service = new AiService(createServices({ model }));

    await service.checkModel({
      requestOptions: { maxRetries: 2 },
      timeout: 1000,
      uniqueModelId: model.id,
    });

    expect(embedManyMock).not.toHaveBeenCalled();
    expect(mockAgentConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        modelId: model.modelId,
        system: 'test',
      }),
    );
    expect(mockGenerate).toHaveBeenCalledWith({ prompt: 'hi' }, expect.any(AbortSignal));
  });
});

function createServices({
  assistant,
  model,
  provider = createProvider(),
}: {
  assistant?: Assistant;
  model: Model;
  provider?: Provider;
}) {
  return {
    assistant: {
      getById: jest.fn(async () => assistant),
    },
    model: {
      getById: jest.fn(async () => model),
    },
    provider: {
      getAuthConfig: jest.fn(async () => null),
      getByProviderId: jest.fn(async () => provider),
      getRotatedApiKey: jest.fn(async () => 'rotated-key'),
    },
  } as unknown as AiServiceDependencies;
}

function createProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    apiFeatures: {
      arrayContent: true,
      developerRole: true,
      enableThinking: false,
      serviceTier: true,
      streamOptions: true,
      verbosity: false,
    },
    apiKeys: [],
    authType: 'api-key',
    endpointConfigs: {
      [ENDPOINT_TYPE.OPENAI_CHAT_COMPLETIONS]: {
        baseUrl: 'https://api.example.com',
      },
      [ENDPOINT_TYPE.OPENAI_EMBEDDINGS]: {
        baseUrl: 'https://api.example.com',
      },
    },
    id: 'test-provider',
    isEnabled: true,
    name: 'Test Provider',
    settings: {},
    ...overrides,
  };
}

function createModel(modelId: string, overrides: Partial<Model> = {}): Model {
  const providerId = overrides.providerId ?? 'test-provider';
  return {
    capabilities: [],
    id: createUniqueModelId(providerId, modelId),
    isDeprecated: false,
    isEnabled: true,
    isHidden: false,
    modelId,
    name: modelId,
    providerId,
    supportsStreaming: true,
    ...overrides,
  };
}

function createAssistant(modelId: Model['id']): Assistant {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    description: '',
    emoji: '',
    id: '00000000-0000-4000-8000-000000000001',
    knowledgeBaseIds: [],
    mcpServerIds: [],
    modelId,
    modelName: null,
    name: 'Assistant',
    prompt: '',
    settings: {
      ...DEFAULT_ASSISTANT_SETTINGS,
      customParameters: [
        { name: 'customFlag', type: 'boolean', value: true },
        { name: 'reasoning_effort', type: 'string', value: 'low' },
      ],
    },
    tags: [],
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}
