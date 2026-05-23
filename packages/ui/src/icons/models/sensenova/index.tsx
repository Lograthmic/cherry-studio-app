import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { SensenovaAvatar } from './avatar';
import { SensenovaLight as SensenovaDark } from './light';
import { SensenovaLight } from './light';

const Sensenova = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? SensenovaDark : SensenovaLight;

  return <Icon {...props} />;
};

export const SensenovaIcon: CompoundIcon = Object.assign(Sensenova, {
  Avatar: SensenovaAvatar,
  colorPrimary: '#01FFB9',
});

export default SensenovaIcon;
