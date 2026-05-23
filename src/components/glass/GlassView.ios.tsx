import {
  GlassView as ExpoGlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { withUniwind } from 'uniwind';
import { GlassFallbackView, type GlassViewProps } from '@/components/glass/GlassFallbackView';

const StyledExpoGlassView = withUniwind(ExpoGlassView);

export type { GlassViewProps };

export function isAppGlassAvailable() {
  return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
}

export function GlassView(props: GlassViewProps) {
  if (!isAppGlassAvailable()) {
    return <GlassFallbackView {...props} />;
  }

  const {
    fallbackBlurMethod: _fallbackBlurMethod,
    fallbackIntensity: _fallbackIntensity,
    fallbackTint: _fallbackTint,
    ...glassProps
  } = props;

  return <StyledExpoGlassView {...glassProps} />;
}
