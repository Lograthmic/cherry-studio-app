import {
  GlassContainer as ExpoGlassContainer,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';
import type { GlassContainerProps } from '@/components/glass/GlassContainer.android';

const StyledExpoGlassContainer = withUniwind(ExpoGlassContainer);
const StyledView = withUniwind(View);

export type { GlassContainerProps };

function isGlassContainerAvailable() {
  return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
}

export function GlassContainer({ spacing, ...viewProps }: GlassContainerProps) {
  if (!isGlassContainerAvailable()) {
    return <StyledView {...viewProps} />;
  }

  return <StyledExpoGlassContainer {...viewProps} spacing={spacing} />;
}
