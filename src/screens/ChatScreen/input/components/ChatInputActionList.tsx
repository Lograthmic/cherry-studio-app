import { cn } from 'heroui-native/utils';
import { CheckIcon, ChevronRightIcon } from 'lucide-uniwind';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

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
            <Pressable
              accessibilityLabel={title}
              accessibilityRole="button"
              accessibilityState={{ selected: isReasoningActive }}
              className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
              key={action.id}
              onPress={onReasoningPress}
            >
              <Icon
                className={cn('size-7', isReasoningActive ? 'text-accent' : 'text-foreground')}
                strokeWidth={2}
              />
              <Text
                className={cn(
                  'flex-1 font-semibold text-base',
                  isReasoningActive ? 'text-accent' : 'text-foreground',
                )}
              >
                {title}
              </Text>
              <View className="max-w-40 flex-row items-center gap-2">
                <Text
                  className={cn(
                    'text-right text-base',
                    isReasoningActive ? 'text-accent' : 'text-default-foreground',
                  )}
                  numberOfLines={1}
                >
                  {selectedReasoningOption ? t(selectedReasoningOption.labelKey) : null}
                </Text>
                <ChevronRightIcon
                  className={cn(
                    'size-5',
                    isReasoningActive ? 'text-accent' : 'text-default-foreground',
                  )}
                  strokeWidth={2}
                />
              </View>
            </Pressable>
          );
        }

        const isSelected = action.id === selectedActionId;

        return (
          <Pressable
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
            key={action.id}
            onPress={() => onActionPress(action.id)}
          >
            <Icon
              className={cn('size-7', isSelected ? 'text-accent' : 'text-foreground')}
              strokeWidth={2}
            />
            <Text
              className={cn(
                'flex-1 font-semibold text-base',
                isSelected ? 'text-accent' : 'text-foreground',
              )}
            >
              {title}
            </Text>
            {isSelected ? <CheckIcon className="size-5 text-accent" strokeWidth={2.25} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
