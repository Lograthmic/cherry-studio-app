import type { GlassContainerProps as ExpoGlassContainerProps } from 'expo-glass-effect';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledView = withUniwind(View);

export type GlassContainerProps = ExpoGlassContainerProps & {
  className?: string;
};

export function GlassContainer({ spacing: _spacing, ...viewProps }: GlassContainerProps) {
  return <StyledView {...viewProps} />;
}
