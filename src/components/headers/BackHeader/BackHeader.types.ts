import type { StackToolbarButtonProps } from 'expo-router';
import type { ComponentType } from 'react';

type HeaderAndroidIconProps = {
  className?: string;
  strokeWidth?: number;
};

export type HeaderToolbarAction = Pick<
  StackToolbarButtonProps,
  'accessibilityLabel' | 'disabled' | 'hidden' | 'icon' | 'onPress' | 'tintColor' | 'variant'
> & {
  androidIcon?: ComponentType<HeaderAndroidIconProps>;
  key: string;
};
