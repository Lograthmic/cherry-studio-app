import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { PalmAvatar } from './avatar';
import { PalmLight as PalmDark } from './light';
import { PalmLight } from './light';

const Palm = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? PalmDark : PalmLight;

  return <Icon {...props} />;
};

export const PalmIcon: CompoundIcon = Object.assign(Palm, {
  Avatar: PalmAvatar,
  colorPrimary: '#FEFEFE',
});

export default PalmIcon;
