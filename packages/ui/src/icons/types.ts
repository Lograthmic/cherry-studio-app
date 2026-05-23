import type { ComponentType, ReactNode } from 'react';
import type { SvgProps } from 'react-native-svg';

export type IconVariant = 'light' | 'dark';

export type IconComponentProps = SvgProps & {
  className?: string;
};

export type IconComponent = ComponentType<IconComponentProps>;

export type CompoundIconProps = IconComponentProps & {
  variant?: IconVariant;
};

export type IconAvatarProps = {
  icon: IconComponent | CompoundIcon;
  size?: number;
  shape?: 'circle' | 'rounded';
  background?: string;
  className?: string;
};

export type CompoundIcon = ComponentType<CompoundIconProps> & {
  Avatar: ComponentType<Omit<IconAvatarProps, 'icon'>>;
  colorPrimary: string;
};

export interface IconMeta {
  id: string;
  colorPrimary: string;
  colorScheme?: 'mono' | 'color';
}

export interface CatalogEntry extends IconMeta {
  component: CompoundIcon;
}

export type IconProps = CompoundIconProps & {
  id: string;
  size?: number | string;
  fallback?: ReactNode;
};
