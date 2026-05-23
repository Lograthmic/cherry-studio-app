import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { AyaAvatar } from './avatar';
import { AyaLight as AyaDark } from './light';
import { AyaLight } from './light';

const Aya = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? AyaDark : AyaLight;

  return <Icon {...props} />;
};

export const AyaIcon: CompoundIcon = Object.assign(Aya, {
  Avatar: AyaAvatar,
  colorPrimary: '#010201',
});

export default AyaIcon;
