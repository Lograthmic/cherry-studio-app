import { DEFAULT_ASSISTANT_SETTINGS } from '../assistant';

describe('assistant data schemas', () => {
  test('keeps reasoning effort in the default settings payload', () => {
    expect(DEFAULT_ASSISTANT_SETTINGS.reasoning_effort).toBe('default');
  });
});
