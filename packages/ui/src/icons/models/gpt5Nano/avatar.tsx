import { View } from 'react-native';
import { useUniwind } from 'uniwind';

import type { IconAvatarProps } from '../../types';
import { Gpt5NanoDark } from './dark';
import { Gpt5NanoLight } from './light';

export function Gpt5NanoAvatar({
  size = 32,
  shape = 'circle',
  background = '#FFFFFF',
  className: _className,
}: Omit<IconAvatarProps, 'icon'>) {
  const { theme } = useUniwind();
  const Icon = theme === 'dark' ? Gpt5NanoDark : Gpt5NanoLight;
  const borderRadius = shape === 'circle' ? size / 2 : size * 0.2;
  const iconSize = size * 0.7;

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
