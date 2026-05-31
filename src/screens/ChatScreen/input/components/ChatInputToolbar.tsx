import { BrainIcon, XIcon } from 'lucide-uniwind';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import { withUniwind } from 'uniwind';

import {
  ChatInputAccessoryItem,
  ChatInputAccessorySection,
} from '@/screens/ChatScreen/input/components/ChatInputAccessory';
import type { ChatInputAction } from '@/screens/ChatScreen/input/utils/chatInputActions';

type ChatInputToolbarProps = {
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

const StyledPressable = withUniwind(Pressable);

export function ChatInputToolbar({
  onReasoningEffortClear,
  onToolClear,
  selectedTool,
  shouldShowReasoningEffortTag,
}: ChatInputToolbarProps) {
  const hasToolbarContent = selectedTool !== undefined || shouldShowReasoningEffortTag;
  const toolbarClassName = hasToolbarContent
    ? 'flex-row flex-wrap gap-2 self-start p-2'
    : 'flex-row flex-wrap gap-2 self-start p-0';

  return (
    <ChatInputAccessorySection
      className={toolbarClassName}
      pointerEvents={hasToolbarContent ? 'auto' : 'none'}
    >
      {shouldShowReasoningEffortTag ? (
        <SelectedReasoningEffortTag onClear={onReasoningEffortClear} />
      ) : null}
      {selectedTool ? <SelectedToolTag tool={selectedTool} onClear={onToolClear} /> : null}
    </ChatInputAccessorySection>
  );
}

function SelectedToolTag({ onClear, tool }: SelectedToolTagProps) {
  const { t } = useTranslation();
  const Icon = tool.icon;

  return (
    <ChatInputAccessoryItem className="flex-row items-center gap-2 rounded-full bg-accent/10 px-2 py-1">
      <Icon className="size-5 text-accent" strokeWidth={2.25} />
      <Text className="font-semibold text-accent text-base" numberOfLines={1}>
        {t(tool.tagTitleKey)}
      </Text>
      <ClearTagButton onPress={onClear} />
    </ChatInputAccessoryItem>
  );
}

function SelectedReasoningEffortTag({ onClear }: SelectedReasoningEffortTagProps) {
  const { t } = useTranslation();

  return (
    <ChatInputAccessoryItem className="flex-row items-center gap-2 rounded-full bg-accent/10 px-2 py-1">
      <BrainIcon className="size-5 text-accent" strokeWidth={2.25} />
      <Text className="font-semibold text-accent text-base" numberOfLines={1}>
        {t('chat.tools.think')}
      </Text>
      <ClearTagButton onPress={onClear} />
    </ChatInputAccessoryItem>
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
