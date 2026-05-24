import {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  type WithTimingConfig,
} from 'react-native-reanimated';

export const chatInputMotionConfig = {
  duration: 180,
  easing: Easing.out(Easing.cubic),
  reduceMotion: ReduceMotion.Never,
} as const satisfies WithTimingConfig;

export const chatInputLayoutTransition = LinearTransition.duration(chatInputMotionConfig.duration)
  .easing(chatInputMotionConfig.easing)
  .reduceMotion(chatInputMotionConfig.reduceMotion);

export const chatInputFadeIn = FadeIn.duration(chatInputMotionConfig.duration)
  .easing(chatInputMotionConfig.easing)
  .reduceMotion(chatInputMotionConfig.reduceMotion);

export const chatInputFadeOut = FadeOut.duration(chatInputMotionConfig.duration)
  .easing(chatInputMotionConfig.easing)
  .reduceMotion(chatInputMotionConfig.reduceMotion);
