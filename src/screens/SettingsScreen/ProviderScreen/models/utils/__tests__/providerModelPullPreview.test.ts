import { MODEL_CAPABILITY } from '@cherrystudio/provider-registry';
import { createUniqueModelId, type Model } from '@/data/types/model';
import {
  buildProviderModelPullApplyPayload,
  buildProviderModelPullPreview,
  createDefaultProviderModelPullSelection,
} from '../providerModelPullPreview';

describe('provider model pull preview helpers', () => {
  test('diffs added remote models and missing preset local models', () => {
    const preview = buildProviderModelPullPreview({
      localModels: [
        model({ modelId: 'gpt-4o', presetModelId: 'gpt-4o' }),
        model({ modelId: 'old-model', presetModelId: 'old-model' }),
        model({ modelId: 'custom-local' }),
      ],
      providerId: 'openai',
      remoteModels: [
        model({ modelId: 'gpt-4o', presetModelId: 'gpt-4o' }),
        { modelId: 'gpt-4o-mini', name: 'GPT-4o mini' },
      ],
    });

    expect(preview.added.map((item) => item.id)).toEqual(['openai::gpt-4o-mini']);
    expect(preview.missing.map((item) => item.id)).toEqual(['openai::old-model']);
  });

  test('enriches added remote models with registry metadata', () => {
    const preview = buildProviderModelPullPreview({
      localModels: [],
      providerId: 'cherryin',
      registryResolver: () => ({
        presetModel: {
          capabilities: [MODEL_CAPABILITY.REASONING, MODEL_CAPABILITY.FUNCTION_CALL],
          id: 'deepseek-v3-2',
          metadata: {},
          name: 'DeepSeek-V3.2-Thinking',
        },
        registryOverride: null,
      }),
      remoteModels: [{ modelId: 'agent/deepseek-v3.2' }],
    });

    expect(preview.added[0]).toMatchObject({
      capabilities: [MODEL_CAPABILITY.REASONING, MODEL_CAPABILITY.FUNCTION_CALL],
      modelId: 'agent/deepseek-v3.2',
      name: 'DeepSeek-V3.2-Thinking',
      presetModelId: 'deepseek-v3-2',
    });
    expect(
      buildProviderModelPullApplyPayload(preview, createDefaultProviderModelPullSelection(preview)),
    ).toEqual({
      toAdd: [
        expect.objectContaining({
          capabilities: [MODEL_CAPABILITY.REASONING, MODEL_CAPABILITY.FUNCTION_CALL],
          modelId: 'agent/deepseek-v3.2',
          presetModelId: 'deepseek-v3-2',
        }),
      ],
      toRemove: [],
    });
  });

  test('preserves concrete remote groups in pull preview', () => {
    const preview = buildProviderModelPullPreview({
      localModels: [],
      providerId: 'cherryin',
      remoteModels: [
        {
          group: 'custom',
          modelId: 'anthropic/claude-sonnet-4-5',
          name: 'Claude Sonnet 4.5',
        },
      ],
    });

    expect(preview.added[0]).toMatchObject({
      group: 'custom',
      modelId: 'anthropic/claude-sonnet-4-5',
    });
    expect(
      buildProviderModelPullApplyPayload(preview, createDefaultProviderModelPullSelection(preview)),
    ).toEqual({
      toAdd: [
        expect.objectContaining({
          group: 'custom',
          modelId: 'anthropic/claude-sonnet-4-5',
        }),
      ],
      toRemove: [],
    });
  });

  test('default selection includes all diff rows and payload only includes selected rows', () => {
    const preview = buildProviderModelPullPreview({
      localModels: [model({ modelId: 'old-model', presetModelId: 'old-model' })],
      providerId: 'openai',
      remoteModels: [{ modelId: 'gpt-4o', name: 'GPT-4o' }],
    });
    const selection = createDefaultProviderModelPullSelection(preview);

    expect(selection.addedIds).toEqual(new Set(['openai::gpt-4o']));
    expect(selection.missingIds).toEqual(new Set(['openai::old-model']));

    selection.missingIds.clear();
    const payload = buildProviderModelPullApplyPayload(preview, selection);

    expect(payload).toEqual({
      toAdd: [
        expect.objectContaining({
          modelId: 'gpt-4o',
          name: 'GPT-4o',
          providerId: 'openai',
        }),
      ],
      toRemove: [],
    });
  });

  test('returns null apply payload when no rows are selected', () => {
    const preview = buildProviderModelPullPreview({
      localModels: [model({ modelId: 'old-model', presetModelId: 'old-model' })],
      providerId: 'openai',
      remoteModels: [{ modelId: 'gpt-4o' }],
    });

    expect(
      buildProviderModelPullApplyPayload(preview, {
        addedIds: new Set(),
        missingIds: new Set(),
      }),
    ).toBeNull();
  });
});

function model(input: {
  modelId: string;
  name?: string;
  presetModelId?: string;
  providerId?: string;
}): Model {
  const providerId = input.providerId ?? 'openai';
  return {
    capabilities: [],
    id: createUniqueModelId(providerId, input.modelId),
    isDeprecated: false,
    isEnabled: true,
    isHidden: false,
    modelId: input.modelId,
    name: input.name ?? input.modelId,
    presetModelId: input.presetModelId,
    providerId,
    supportsStreaming: true,
  };
}
