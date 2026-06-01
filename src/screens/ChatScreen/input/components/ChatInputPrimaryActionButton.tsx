import { ArrowUpIcon, AudioLinesIcon } from 'lucide-uniwind';
import { Pressable } from 'react-native';
import {
  useChatInputActions,
  useChatInputState,
} from '@/screens/ChatScreen/input/context/ChatInputProvider';

const buttonSize = 32;

type ChatInputPrimaryActionButtonProps = {
  isVoiceBusy: boolean;
  onVoiceInputPress: () => void | Promise<void>;
};

export function ChatInputPrimaryActionButton({
  isVoiceBusy,
  onVoiceInputPress,
}: ChatInputPrimaryActionButtonProps) {
  const { setInputFocused } = useChatInputActions();
  const { draft } = useChatInputState();
  const shouldShowSend = draft.trim().length > 0;
  const Icon = shouldShowSend ? ArrowUpIcon : AudioLinesIcon;
  const accessibilityLabel = shouldShowSend ? 'Send message' : 'Voice input';
  const handlePress = async () => {
    if (shouldShowSend) {
      return;
    }

    setInputFocused(false);
    await onVoiceInputPress();
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="absolute right-1.5 bottom-1.5 items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-70"
      disabled={isVoiceBusy}
      hitSlop={6}
      onPress={handlePress}
      style={{
        height: buttonSize,
        width: buttonSize,
      }}
    >
      <Icon className="size-5 text-foreground" strokeWidth={2} />
    </Pressable>
  );
}
