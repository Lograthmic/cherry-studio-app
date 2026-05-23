import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { KimiAvatar } from './avatar';
import { KimiDark } from './dark';
import { KimiLight } from './light';

const Kimi = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? KimiDark : KimiLight;

  return <Icon {...props} />;
};

export const KimiIcon: CompoundIcon = Object.assign(Kimi, {
  Avatar: KimiAvatar,
  colorPrimary: '#000000',
});

export default KimiIcon;
