import { type PropsWithChildren } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { withUniwind } from 'uniwind';
import {
  chatInputFadeIn,
  chatInputLayoutTransition,
} from '@/screens/ChatScreen/input/utils/chatInputMotion';

type ChatInputAccessorySectionProps = PropsWithChildren<
  ViewProps & {
    className?: string;
  }
>;

type ChatInputAccessoryItemProps = PropsWithChildren<
  ViewProps & {
    className?: string;
  }
>;

const StyledAnimatedView = withUniwind(Animated.View);

export function ChatInputAccessorySection({
  children,
  className,
  style,
  ...props
}: ChatInputAccessorySectionProps) {
  return (
    <StyledAnimatedView
      className={className}
      layout={chatInputLayoutTransition}
      style={[styles.section, style]}
      {...props}
    >
      {children}
    </StyledAnimatedView>
  );
}

export function ChatInputAccessoryItem({
  children,
  className,
  ...props
}: ChatInputAccessoryItemProps) {
  return (
    <StyledAnimatedView
      className={className}
      entering={chatInputFadeIn}
      layout={chatInputLayoutTransition}
      {...props}
    >
      {children}
    </StyledAnimatedView>
  );
}

const styles = StyleSheet.create({
  section: {
    overflow: 'hidden',
  },
});
