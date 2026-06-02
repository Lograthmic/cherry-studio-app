import { cn } from 'heroui-native/utils';
import { PlusIcon } from 'lucide-uniwind';
import { Pressable, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { chatInputMinTextAreaHeight } from '@/screens/ChatScreen/input/chatInputLayout';
import { useChatInputActions } from '@/screens/ChatScreen/input/context/ChatInputProvider';

type ChatInputAddButtonProps = {
  separatedSurfaceStyle: AnimatedStyle<ViewStyle>;
};

const inputSurfaceClassName = 'bg-field ios:shadow-field android:shadow-sm';

export function ChatInputAddButton({ separatedSurfaceStyle }: ChatInputAddButtonProps) {
  const { openActionSheet } = useChatInputActions();

  return (
    <Pressable
      accessibilityLabel="Add"
      accessibilityRole="button"
      className="items-center justify-center rounded-full active:opacity-70"
      hitSlop={6}
      onPress={openActionSheet}
      style={{
        height: chatInputMinTextAreaHeight,
        width: chatInputMinTextAreaHeight,
      }}
    >
      <Animated.View
        className={cn('absolute inset-0 rounded-full', inputSurfaceClassName)}
        pointerEvents="none"
        style={separatedSurfaceStyle}
      />
      <PlusIcon className="size-5 text-foreground" strokeWidth={2} />
    </Pressable>
  );
}
