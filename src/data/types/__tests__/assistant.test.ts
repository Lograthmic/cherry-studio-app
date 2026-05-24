import {
  DEFAULT_ASSISTANT_SETTINGS,
  ListAssistantsQuerySchema,
  UpdateAssistantSchema,
} from '../assistant';

describe('assistant data schemas', () => {
  test('keeps reasoning effort in the default settings payload', () => {
    expect(DEFAULT_ASSISTANT_SETTINGS.reasoning_effort).toBe('default');
  });

  test('fills assistant list pagination defaults', () => {
    expect(ListAssistantsQuerySchema.parse({})).toMatchObject({
      limit: 100,
      page: 1,
    });
  });

  test('accepts partial settings updates without requiring the full settings object', () => {
    const result = UpdateAssistantSchema.safeParse({
      settings: {
        reasoning_effort: 'high',
      },
    });

    expect(result.success).toBe(true);
  });
});
