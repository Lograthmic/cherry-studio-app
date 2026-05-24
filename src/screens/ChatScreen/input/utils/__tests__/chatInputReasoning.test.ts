import {
  CHAT_INPUT_DEFAULT_REASONING_EFFORT,
  chatInputReasoningEffortOptions,
  getChatInputReasoningEffortOption,
  isChatInputReasoningEffortActive,
  shouldShowChatInputReasoningEffortTag,
} from '../chatInputReasoning';

describe('chat input reasoning', () => {
  test('includes the supported local reasoning options in display order', () => {
    expect(chatInputReasoningEffortOptions.map((option) => option.value)).toEqual([
      'default',
      'none',
      'minimal',
      'low',
      'medium',
      'high',
      'max',
      'auto',
    ]);
  });

  test('finds reasoning effort options by value', () => {
    expect(getChatInputReasoningEffortOption('high')?.labelKey).toBe('chat.reasoning.high');
    expect(getChatInputReasoningEffortOption('unknown')).toBeUndefined();
  });

  test('only treats concrete enabled reasoning efforts as active', () => {
    expect(isChatInputReasoningEffortActive(CHAT_INPUT_DEFAULT_REASONING_EFFORT)).toBe(false);
    expect(isChatInputReasoningEffortActive('none')).toBe(false);
    expect(isChatInputReasoningEffortActive('high')).toBe(true);
  });

  test('shows the reasoning tag for selected default or enabled efforts only', () => {
    expect(shouldShowChatInputReasoningEffortTag(false, CHAT_INPUT_DEFAULT_REASONING_EFFORT)).toBe(
      false,
    );
    expect(shouldShowChatInputReasoningEffortTag(true, CHAT_INPUT_DEFAULT_REASONING_EFFORT)).toBe(
      true,
    );
    expect(shouldShowChatInputReasoningEffortTag(true, 'none')).toBe(false);
    expect(shouldShowChatInputReasoningEffortTag(true, 'high')).toBe(true);
  });
});
