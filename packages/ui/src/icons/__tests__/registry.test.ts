import { MODEL_ICONS } from '../../icons-png/models';
import { PROVIDER_ICONS } from '../../icons-png/providers';
import {
  resolveIcon,
  resolveModelIcon,
  resolveModelProviderIcon,
  resolveModelToProviderIcon,
  resolveProviderIcon,
} from '../registry';

describe('png icon registry', () => {
  test('resolves the most specific model icon first', () => {
    expect(resolveModelIcon('gpt-5.1-codex-mini')).toBe(MODEL_ICONS['gpt-5-1-codex-mini']);
  });

  test('keeps model icon patterns aligned with desktop aliases', () => {
    expect(resolveModelIcon('hunyuan-t1')).toBe(MODEL_ICONS.hunyuan);
    expect(resolveModelIcon('mimo-vl-7b')).toBe(MODEL_ICONS.mimo);
    expect(resolveModelIcon('kimi-k2')).toBe(MODEL_ICONS.kimi);
  });

  test('resolves provider aliases and desktop-style provider asset ids', () => {
    expect(resolveProviderIcon('azure-openai')).toBe(resolveProviderIcon('azureai'));
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

  test('falls back from model to provider icon', () => {
    expect(resolveModelProviderIcon('custom-chat-model', 'azure-openai')).toBe(
      PROVIDER_ICONS.azureai,
    );
  });

  test('resolves the full desktop-style fallback chain', () => {
    expect(resolveIcon('gpt-5.1-codex-mini', 'openai')).toBe(MODEL_ICONS['gpt-5-1-codex-mini']);
    expect(resolveIcon('llama-3.1-70b', 'openai')).toBe(PROVIDER_ICONS.meta);
    expect(resolveIcon('custom-chat-model', 'azure-openai')).toBe(PROVIDER_ICONS.azureai);
  });

  test('returns undefined when no resolver branch matches', () => {
    expect(resolveIcon('unknown-model', 'unknown-provider')).toBeUndefined();
  });
});
