import { ListAssistantsQuerySchema, UpdateAssistantSchema } from '../assistants';

describe('assistant api schemas', () => {
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
