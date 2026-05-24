import { CheckIcon, ChevronRightIcon } from 'lucide-uniwind';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

import {
  type ChatInputActionId,
  chatInputActions,
} from '@/screens/ChatScreen/input/utils/chatInputActions';
import {
  type ChatInputReasoningEffort,
  getChatInputReasoningEffortOption,
  isChatInputReasoningEffortActive,
} from '@/screens/ChatScreen/input/utils/chatInputReasoning';

type ChatInputActionListProps = {
  onActionPress: (actionId: ChatInputActionId) => void;
  onReasoningPress: () => void;
  reasoningEffort: ChatInputReasoningEffort;
  selectedActionId: ChatInputActionId | null;
};

const StyledPressable = withUniwind(Pressable);

export function ChatInputActionList({
  onActionPress,
  onReasoningPress,
  reasoningEffort,
  selectedActionId,
}: ChatInputActionListProps) {
  const { t } = useTranslation();
  const selectedReasoningOption = getChatInputReasoningEffortOption(reasoningEffort);

  return (
    <View className="gap-1">
      {chatInputActions.map((action) => {
        const Icon = action.icon;
        const title = t(action.titleKey);

        if (action.id === 'think') {
          const isReasoningActive = isChatInputReasoningEffortActive(reasoningEffort);

          return (
            <StyledPressable
              accessibilityLabel={title}
              accessibilityRole="button"
              accessibilityState={{ selected: isReasoningActive }}
              className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
              key={action.id}
              onPress={onReasoningPress}
            >
              <Icon
                className={['size-7', isReasoningActive ? 'text-accent' : 'text-foreground'].join(
                  ' ',
                )}
                strokeWidth={2}
              />
              <Text
                className={[
                  'flex-1 font-semibold text-base',
                  isReasoningActive ? 'text-accent' : 'text-foreground',
                ].join(' ')}
              >
                {title}
              </Text>
              <View className="max-w-40 flex-row items-center gap-2">
                <Text
                  className={[
                    'text-right text-base',
                    isReasoningActive ? 'text-accent' : 'text-default-foreground',
                  ].join(' ')}
                  numberOfLines={1}
                >
                  {selectedReasoningOption ? t(selectedReasoningOption.labelKey) : null}
                </Text>
                <ChevronRightIcon
                  className={[
                    'size-5',
                    isReasoningActive ? 'text-accent' : 'text-default-foreground',
                  ].join(' ')}
                  strokeWidth={2}
                />
              </View>
            </StyledPressable>
          );
        }

        const isSelected = action.id === selectedActionId;

        return (
          <StyledPressable
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
            key={action.id}
            onPress={() => onActionPress(action.id)}
          >
            <Icon
              className={['size-7', isSelected ? 'text-accent' : 'text-foreground'].join(' ')}
              strokeWidth={2}
            />
            <Text
              className={[
                'flex-1 font-semibold text-base',
                isSelected ? 'text-accent' : 'text-foreground',
              ].join(' ')}
            >
              {title}
            </Text>
            {isSelected ? <CheckIcon className="size-5 text-accent" strokeWidth={2.25} /> : null}
          </StyledPressable>
        );
      })}
    </View>
  );
}
