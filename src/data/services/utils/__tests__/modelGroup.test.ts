import { getDefaultFetchedModelGroupName, normalizeFetchedModelGroupName } from '../modelGroup';

describe('model group helpers', () => {
  test('matches desktop fetched-model default group behavior', () => {
    expect(getDefaultFetchedModelGroupName('anthropic/claude-sonnet-4-5', 'cherryin')).toBe(
      'anthropic',
    );
    expect(getDefaultFetchedModelGroupName('gpt-4o', 'openai')).toBe('openai');
  });

  test('uses default group when remote group is missing', () => {
    expect(
      normalizeFetchedModelGroupName(undefined, 'anthropic/claude-sonnet-4-5', 'cherryin'),
    ).toBe('anthropic');
    expect(normalizeFetchedModelGroupName('', 'gpt-4o', 'openai')).toBe('openai');
  });

  test('keeps concrete remote groups', () => {
    expect(
      normalizeFetchedModelGroupName('Anthropic', 'anthropic/claude-sonnet-4-5', 'cherryin'),
    ).toBe('Anthropic');
    expect(
      normalizeFetchedModelGroupName('custom', 'anthropic/claude-sonnet-4-5', 'cherryin'),
    ).toBe('custom');
  });
});
