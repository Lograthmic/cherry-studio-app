import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt52ProAvatar } from './avatar';
import { Gpt52ProLight as Gpt52ProDark } from './light';
import { Gpt52ProLight } from './light';

const Gpt52Pro = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt52ProDark : Gpt52ProLight;

  return <Icon {...props} />;
};

export const Gpt52ProIcon: CompoundIcon = Object.assign(Gpt52Pro, {
  Avatar: Gpt52ProAvatar,
  colorPrimary: '#000000',
});

export default Gpt52ProIcon;
