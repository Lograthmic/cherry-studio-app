import { useThemeColor } from 'heroui-native/hooks';
import Animated, { FadeOut } from 'react-native-reanimated';

type ChatInitialRenderCoverProps = {
  bottomInset: number;
  isVisible: boolean;
};

export function ChatInitialRenderCover({ bottomInset, isVisible }: ChatInitialRenderCoverProps) {
  const backgroundColor = useThemeColor('background');

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      className="absolute inset-0"
      exiting={FadeOut.duration(100)}
      pointerEvents="none"
      style={{ backgroundColor, bottom: bottomInset, zIndex: 5 }}
    />
  );
}
