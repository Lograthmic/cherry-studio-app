import { CheckIcon, ChevronLeftIcon } from 'lucide-uniwind';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

import {
  type ChatInputReasoningEffort,
  chatInputReasoningEffortOptions,
} from '@/screens/ChatScreen/input/utils/chatInputReasoning';

type ChatInputReasoningSheetPageProps = {
  onBack: () => void;
  onReasoningEffortChange: (reasoningEffort: ChatInputReasoningEffort) => void;
  reasoningEffort: ChatInputReasoningEffort;
};

const StyledPressable = withUniwind(Pressable);

export function ChatInputReasoningSheetPage({
  onBack,
  onReasoningEffortChange,
  reasoningEffort,
}: ChatInputReasoningSheetPageProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-4 px-4 pt-2">
      <View className="min-h-8 flex-row items-center gap-3">
        <StyledPressable
          accessibilityLabel={t('navigation.back')}
          accessibilityRole="button"
          className="size-8 items-center justify-center rounded-full active:bg-surface-secondary active:opacity-70"
          hitSlop={6}
          onPress={onBack}
        >
          <ChevronLeftIcon className="size-6 text-foreground" strokeWidth={2} />
        </StyledPressable>
        <Text className="flex-1 font-semibold text-base text-foreground" numberOfLines={1}>
          {t('chat.reasoning.title')}
        </Text>
      </View>
      <View className="gap-1">
        {chatInputReasoningEffortOptions.map((option) => {
          const label = t(option.labelKey);
          const isSelected = option.value === reasoningEffort;

          return (
            <StyledPressable
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
              key={option.value}
              onPress={() => onReasoningEffortChange(option.value)}
            >
              <Text
                className={[
                  'flex-1 font-semibold text-base',
                  isSelected ? 'text-accent' : 'text-foreground',
                ].join(' ')}
                numberOfLines={1}
              >
                {label}
              </Text>
              {isSelected ? <CheckIcon className="size-5 text-accent" strokeWidth={2.25} /> : null}
            </StyledPressable>
          );
        })}
      </View>
    </View>
  );
}
