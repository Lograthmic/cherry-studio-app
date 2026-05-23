import type { PropsWithChildren } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { withUniwind } from 'uniwind';
import { GlassView, type GlassViewProps } from '@/components/glass/GlassView';

const StyledPressable = withUniwind(Pressable);

type TouchableGlassPressableProps = Pick<
  PressableProps,
  | 'accessibilityHint'
  | 'accessibilityLabel'
  | 'accessibilityRole'
  | 'accessibilityState'
  | 'disabled'
  | 'hitSlop'
  | 'onAccessibilityAction'
  | 'onLongPress'
  | 'onPress'
  | 'onPressIn'
  | 'onPressOut'
  | 'testID'
>;

export type TouchableGlassProps = PropsWithChildren<
  GlassViewProps &
    TouchableGlassPressableProps & {
      disabledStyle?: StyleProp<ViewStyle>;
      pressableClassName?: string;
      pressableStyle?: PressableProps['style'];
      pressedStyle?: StyleProp<ViewStyle>;
    }
>;

export function TouchableGlass({
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  children,
  disabled,
  disabledStyle = styles.disabled,
  hitSlop,
  isInteractive,
  onAccessibilityAction,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
  pressableClassName,
  pressableStyle,
  pressedStyle = styles.pressed,
  style,
  testID,
  ...glassProps
}: TouchableGlassProps) {
  return (
    <StyledPressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      className={pressableClassName}
      disabled={disabled}
      hitSlop={hitSlop}
      onAccessibilityAction={onAccessibilityAction}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={pressableStyle}
      testID={testID}
    >
      {({ pressed }) => (
        <GlassView
          {...glassProps}
          isInteractive={isInteractive ?? !disabled}
          style={[
            style,
            pressed && !disabled ? pressedStyle : null,
            disabled ? disabledStyle : null,
          ]}
        >
          {children}
        </GlassView>
      )}
    </StyledPressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});
