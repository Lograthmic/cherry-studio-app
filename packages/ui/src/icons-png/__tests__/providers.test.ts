import { resolveModelProviderIcon, resolveModelToProviderIcon } from '../../icons';
import { PROVIDER_ICONS, resolveProviderIcon } from '../providers';

describe('provider png icon registry', () => {
  test('resolves provider icons by id', () => {
    expect(resolveProviderIcon('openai')).toBe(PROVIDER_ICONS.openai);
  });

  test('resolves provider aliases', () => {
    expect(resolveProviderIcon('azure-openai')).toBe(resolveProviderIcon('azureai'));
  });

  test('resolves kebab-case provider asset ids', () => {
    expect(resolveProviderIcon('arcee-ai')).toBe(PROVIDER_ICONS['arcee-ai']);
    expect(resolveProviderIcon('github-copilot')).toBe(PROVIDER_ICONS['github-copilot']);
    expect(resolveProviderIcon('githubCopilot')).toBe(PROVIDER_ICONS['github-copilot']);
  });

  test('resolves provider icons inferred from model ids', () => {
    expect(resolveModelToProviderIcon('llama-3.1-70b')).toBe(PROVIDER_ICONS.meta);
    expect(resolveModelToProviderIcon('runway-gen-4')).toBe(PROVIDER_ICONS.runway);
    expect(resolveModelToProviderIcon('arcee-ai/spotlight')).toBe(PROVIDER_ICONS['arcee-ai']);
    expect(resolveModelToProviderIcon('dolphin-2.9')).toBe(PROVIDER_ICONS['dolphin-ai']);
  });

  test('falls back to provider id when model id has no provider match', () => {
    expect(resolveModelProviderIcon('custom-chat-model', 'azure-openai')).toBe(
      PROVIDER_ICONS.azureai,
    );
  });
});
