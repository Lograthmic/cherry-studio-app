import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { HailuoAvatar } from './avatar';
import { HailuoLight as HailuoDark } from './light';
import { HailuoLight } from './light';

const Hailuo = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? HailuoDark : HailuoLight;

  return <Icon {...props} />;
};

export const HailuoIcon: CompoundIcon = Object.assign(Hailuo, {
  Avatar: HailuoAvatar,
  colorPrimary: '#000000',
});

export default HailuoIcon;
