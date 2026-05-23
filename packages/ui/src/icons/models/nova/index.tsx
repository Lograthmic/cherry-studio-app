import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { NovaAvatar } from './avatar';
import { NovaLight as NovaDark } from './light';
import { NovaLight } from './light';

const Nova = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? NovaDark : NovaLight;

  return <Icon {...props} />;
};

export const NovaIcon: CompoundIcon = Object.assign(Nova, {
  Avatar: NovaAvatar,
  colorPrimary: '#000000',
});

export default NovaIcon;
