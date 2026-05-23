import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { LingAvatar } from './avatar';
import { LingLight as LingDark } from './light';
import { LingLight } from './light';

const Ling = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? LingDark : LingLight;

  return <Icon {...props} />;
};

export const LingIcon: CompoundIcon = Object.assign(Ling, {
  Avatar: LingAvatar,
  colorPrimary: '#0C73FF',
});

export default LingIcon;
