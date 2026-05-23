import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt5MiniAvatar } from './avatar';
import { Gpt5MiniLight as Gpt5MiniDark } from './light';
import { Gpt5MiniLight } from './light';

const Gpt5Mini = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt5MiniDark : Gpt5MiniLight;

  return <Icon {...props} />;
};

export const Gpt5MiniIcon: CompoundIcon = Object.assign(Gpt5Mini, {
  Avatar: Gpt5MiniAvatar,
  colorPrimary: '#000000',
});

export default Gpt5MiniIcon;
