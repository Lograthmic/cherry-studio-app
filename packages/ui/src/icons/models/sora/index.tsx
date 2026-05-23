import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { SoraAvatar } from './avatar';
import { SoraLight as SoraDark } from './light';
import { SoraLight } from './light';

const Sora = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? SoraDark : SoraLight;

  return <Icon {...props} />;
};

export const SoraIcon: CompoundIcon = Object.assign(Sora, {
  Avatar: SoraAvatar,
  colorPrimary: '#000000',
});

export default SoraIcon;
