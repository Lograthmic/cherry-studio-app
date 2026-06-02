import { PROVIDER_ICONS, resolveProviderIcon } from '../providers';
import { resolveModelProviderIcon, resolveModelToProviderIcon } from '../model-provider-icons';

describe('provider png icon registry', () => {
  test('resolves provider icons by id', () => {
    expect(resolveProviderIcon('openai')).toBe(PROVIDER_ICONS.openai);
  });

  test('resolves provider aliases', () => {
    expect(resolveProviderIcon('azure-openai')).toBe(resolveProviderIcon('azureai'));
  });

  test('resolves kebab-case provider asset ids', () => {
    expect(resolveProviderIcon('arcee-ai')).toBe(PROVIDER_ICONS.arceeAi);
    expect(resolveProviderIcon('github-copilot')).toBe(PROVIDER_ICONS.githubCopilot);
  });

  test('resolves provider icons inferred from model ids', () => {
    expect(resolveModelToProviderIcon('llama-3.1-70b')).toBe(PROVIDER_ICONS.meta);
    expect(resolveModelToProviderIcon('runway-gen-4')).toBe(PROVIDER_ICONS.runway);
  });

  test('falls back to provider id when model id has no provider match', () => {
    expect(resolveModelProviderIcon('custom-chat-model', 'azure-openai')).toBe(
      PROVIDER_ICONS.azureai,
    );
  });
});
