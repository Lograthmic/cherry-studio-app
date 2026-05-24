import { BrainIcon, XIcon } from 'lucide-uniwind';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import type { ChatInputAction } from '@/screens/ChatScreen/input/utils/chatInputActions';
import {
  chatInputFadeIn,
  chatInputFadeOut,
  chatInputLayoutTransition,
  chatInputMotionConfig,
} from '@/screens/ChatScreen/input/utils/chatInputMotion';

type ChatInputToolbarProps = {
  isExiting: boolean;
  onReasoningEffortClear: () => void;
  onToolClear: () => void;
  selectedTool?: ChatInputAction;
  shouldShowReasoningEffortTag: boolean;
};

type SelectedToolTagProps = {
  onClear: () => void;
  tool: ChatInputAction;
};

type SelectedReasoningEffortTagProps = {
  onClear: () => void;
};

const StyledAnimatedView = withUniwind(Animated.View);
const StyledPressable = withUniwind(Pressable);

export function ChatInputToolbar({
  isExiting,
  onReasoningEffortClear,
  onToolClear,
  selectedTool,
  shouldShowReasoningEffortTag,
}: ChatInputToolbarProps) {
  const containerOpacity = useSharedValue(isExiting ? 0 : 1);

  useEffect(() => {
    containerOpacity.value = withTiming(isExiting ? 0 : 1, chatInputMotionConfig);
  }, [containerOpacity, isExiting]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  if (!selectedTool && !shouldShowReasoningEffortTag) {
    return null;
  }

  return (
    <StyledAnimatedView
      className="flex-row flex-wrap gap-2 self-start p-2"
      layout={chatInputLayoutTransition}
      style={containerStyle}
    >
      {shouldShowReasoningEffortTag ? (
        <SelectedReasoningEffortTag onClear={onReasoningEffortClear} />
      ) : null}
      {selectedTool ? <SelectedToolTag tool={selectedTool} onClear={onToolClear} /> : null}
    </StyledAnimatedView>
  );
}

function SelectedToolTag({ onClear, tool }: SelectedToolTagProps) {
  const { t } = useTranslation();
  const Icon = tool.icon;

  return (
    <StyledAnimatedView
      className="flex-row items-center gap-2 rounded-full bg-accent/10 px-2 py-1"
      entering={chatInputFadeIn}
      exiting={chatInputFadeOut}
      layout={chatInputLayoutTransition}
    >
      <Icon className="size-5 text-accent" strokeWidth={2.25} />
      <Text className="font-semibold text-accent text-base" numberOfLines={1}>
        {t(tool.tagTitleKey)}
      </Text>
      <ClearTagButton onPress={onClear} />
    </StyledAnimatedView>
  );
}

function SelectedReasoningEffortTag({ onClear }: SelectedReasoningEffortTagProps) {
  const { t } = useTranslation();

  return (
    <StyledAnimatedView
      className="flex-row items-center gap-2 rounded-full bg-accent/10 px-2 py-1"
      entering={chatInputFadeIn}
      exiting={chatInputFadeOut}
      layout={chatInputLayoutTransition}
    >
      <BrainIcon className="size-5 text-accent" strokeWidth={2.25} />
      <Text className="font-semibold text-accent text-base" numberOfLines={1}>
        {t('chat.tools.think')}
      </Text>
      <ClearTagButton onPress={onClear} />
    </StyledAnimatedView>
  );
}

function ClearTagButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <StyledPressable
      accessibilityLabel={t('common.clear')}
      accessibilityRole="button"
      className="size-7 items-center justify-center rounded-full active:opacity-60"
      hitSlop={6}
      onPress={onPress}
    >
      <XIcon className="size-5 text-accent" strokeWidth={2.25} />
    </StyledPressable>
  );
}
