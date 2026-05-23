import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { MimoAvatar } from './avatar';
import { MimoDark } from './dark';
import { MimoLight } from './light';

const Mimo = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? MimoDark : MimoLight;

  return <Icon {...props} />;
};

export const MimoIcon: CompoundIcon = Object.assign(Mimo, {
  Avatar: MimoAvatar,
  colorPrimary: '#000000',
});

export default MimoIcon;
