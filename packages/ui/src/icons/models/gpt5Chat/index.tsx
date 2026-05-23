import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt5ChatAvatar } from './avatar';
import { Gpt5ChatLight as Gpt5ChatDark } from './light';
import { Gpt5ChatLight } from './light';

const Gpt5Chat = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt5ChatDark : Gpt5ChatLight;

  return <Icon {...props} />;
};

export const Gpt5ChatIcon: CompoundIcon = Object.assign(Gpt5Chat, {
  Avatar: Gpt5ChatAvatar,
  colorPrimary: '#000000',
});

export default Gpt5ChatIcon;
