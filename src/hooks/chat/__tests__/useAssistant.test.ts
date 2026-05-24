import { DEFAULT_ASSISTANT_ID, DEFAULT_ASSISTANT_SETTINGS } from '@/data/types/assistant';
import type { UniqueModelId } from '@/data/types/model';
import { composeDefaultAssistant } from '../utils/defaultAssistant';

describe('composeDefaultAssistant', () => {
  test('returns the default assistant sentinel with the supplied model id', () => {
    const assistant = composeDefaultAssistant('openai::gpt-4o' as UniqueModelId);

    expect(assistant.id).toBe(DEFAULT_ASSISTANT_ID);
    expect(assistant.modelId).toBe('openai::gpt-4o');
    expect(assistant.modelName).toBeNull();
    expect(assistant.settings).toBe(DEFAULT_ASSISTANT_SETTINGS);
  });

  test('uses empty relations and epoch timestamps', () => {
    const assistant = composeDefaultAssistant(null);

    expect(assistant.modelId).toBeNull();
    expect(assistant.mcpServerIds).toEqual([]);
    expect(assistant.knowledgeBaseIds).toEqual([]);
    expect(assistant.tags).toEqual([]);
    expect(assistant.createdAt).toBe(new Date(0).toISOString());
    expect(assistant.updatedAt).toBe(new Date(0).toISOString());
  });
});
