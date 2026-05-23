import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { TrinityAvatar } from './avatar';
import { TrinityDark } from './dark';
import { TrinityLight } from './light';

const Trinity = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? TrinityDark : TrinityLight;

  return <Icon {...props} />;
};

export const TrinityIcon: CompoundIcon = Object.assign(Trinity, {
  Avatar: TrinityAvatar,
  colorPrimary: '#000000',
});

export default TrinityIcon;
