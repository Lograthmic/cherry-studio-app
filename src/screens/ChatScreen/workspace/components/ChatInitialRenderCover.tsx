import Animated, { FadeOut } from 'react-native-reanimated';

type ChatInitialRenderCoverProps = {
  isVisible: boolean;
};

export function ChatInitialRenderCover({ isVisible }: ChatInitialRenderCoverProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      className="absolute inset-0 z-20"
      exiting={FadeOut.duration(400)}
      pointerEvents="none"
    />
  );
}
