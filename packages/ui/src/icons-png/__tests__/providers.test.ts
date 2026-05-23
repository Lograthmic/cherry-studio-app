import { PROVIDER_ICONS, resolveProviderIcon } from '../providers';

describe('provider png icon registry', () => {
  test('resolves provider icons by id', () => {
    expect(resolveProviderIcon('openai')).toBe(PROVIDER_ICONS.openai);
  });

  test('resolves provider aliases', () => {
    expect(resolveProviderIcon('azure-openai')).toBe(resolveProviderIcon('azureai'));
  });
});
