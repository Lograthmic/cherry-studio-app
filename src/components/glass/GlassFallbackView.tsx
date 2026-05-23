import { BlurView, type BlurViewProps } from 'expo-blur';
import type { GlassViewProps as ExpoGlassViewProps } from 'expo-glass-effect';
import { StyleSheet } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledBlurView = withUniwind(BlurView);

export type GlassViewProps = ExpoGlassViewProps & {
  className?: string;
  fallbackBlurMethod?: BlurViewProps['blurMethod'];
  fallbackIntensity?: BlurViewProps['intensity'];
  fallbackTint?: BlurViewProps['tint'];
};

export function GlassFallbackView({
  colorScheme: _colorScheme,
  fallbackBlurMethod = 'none',
  fallbackIntensity = 70,
  fallbackTint = 'systemChromeMaterial',
  glassEffectStyle: _glassEffectStyle,
  isInteractive: _isInteractive,
  ref: _ref,
  style,
  tintColor: _tintColor,
  ...viewProps
}: GlassViewProps) {
  return (
    <StyledBlurView
      {...viewProps}
      blurMethod={fallbackBlurMethod}
      intensity={fallbackIntensity}
      style={[styles.fallback, style]}
      tint={fallbackTint}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    overflow: 'hidden',
  },
});
