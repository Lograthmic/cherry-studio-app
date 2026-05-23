import { View } from 'react-native';
import { useUniwind } from 'uniwind';

import type { IconAvatarProps } from '../../types';
import { Gpt51Dark } from './dark';
import { Gpt51Light } from './light';

export function Gpt51Avatar({
  size = 32,
  shape = 'circle',
  background = '#FFFFFF',
  className: _className,
}: Omit<IconAvatarProps, 'icon'>) {
  const { theme } = useUniwind();
  const Icon = theme === 'dark' ? Gpt51Dark : Gpt51Light;
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
