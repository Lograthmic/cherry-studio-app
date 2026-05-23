import { View } from 'react-native';
import { useUniwind } from 'uniwind';

import type { IconAvatarProps } from '../../types';
import { SoraDark } from './dark';
import { SoraLight } from './light';

export function SoraAvatar({
  size = 32,
  shape = 'circle',
  background = 'transparent',
  className: _className,
}: Omit<IconAvatarProps, 'icon'>) {
  const { theme } = useUniwind();
  const Icon = theme === 'dark' ? SoraDark : SoraLight;
  const borderRadius = shape === 'circle' ? size / 2 : size * 0.2;
  const iconSize = size * 0.82;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: background,
        borderRadius,
        height: size,
        justifyContent: 'center',
        overflow: 'hidden',
        width: size,
      }}
    >
      <Icon height={iconSize} width={iconSize} />
    </View>
  );
}
