import { REASONING_EFFORT, type ReasoningEffort } from '@cherrystudio/provider-registry';

export const CHAT_INPUT_DEFAULT_REASONING_EFFORT = 'default';

export type ChatInputReasoningEffort = typeof CHAT_INPUT_DEFAULT_REASONING_EFFORT | ReasoningEffort;

type ChatInputReasoningEffortOption = {
  labelKey: string;
  value: ChatInputReasoningEffort;
};

export const chatInputReasoningEffortOptions = [
  {
    labelKey: 'chat.reasoning.default',
    value: CHAT_INPUT_DEFAULT_REASONING_EFFORT,
  },
  {
    labelKey: 'chat.reasoning.off',
    value: REASONING_EFFORT.NONE,
  },
  {
    labelKey: 'chat.reasoning.minimal',
    value: REASONING_EFFORT.MINIMAL,
  },
  {
    labelKey: 'chat.reasoning.low',
    value: REASONING_EFFORT.LOW,
  },
  {
    labelKey: 'chat.reasoning.medium',
    value: REASONING_EFFORT.MEDIUM,
  },
  {
    labelKey: 'chat.reasoning.high',
    value: REASONING_EFFORT.HIGH,
  },
  {
    labelKey: 'chat.reasoning.max',
    value: REASONING_EFFORT.MAX,
  },
  {
    labelKey: 'chat.reasoning.auto',
    value: REASONING_EFFORT.AUTO,
  },
] as const satisfies readonly ChatInputReasoningEffortOption[];

export function getChatInputReasoningEffortOption(value: string | null | undefined) {
  return chatInputReasoningEffortOptions.find((option) => option.value === value);
}

export function isChatInputReasoningEffortActive(reasoningEffort: ChatInputReasoningEffort) {
  return (
    reasoningEffort !== CHAT_INPUT_DEFAULT_REASONING_EFFORT &&
    reasoningEffort !== REASONING_EFFORT.NONE
  );
}

export function shouldShowChatInputReasoningEffortTag(
  isReasoningEffortSelected: boolean,
  reasoningEffort: ChatInputReasoningEffort,
) {
  return isReasoningEffortSelected && reasoningEffort !== REASONING_EFFORT.NONE;
}
