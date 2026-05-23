import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt51ChatAvatar } from './avatar';
import { Gpt51ChatLight as Gpt51ChatDark } from './light';
import { Gpt51ChatLight } from './light';

const Gpt51Chat = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt51ChatDark : Gpt51ChatLight;

  return <Icon {...props} />;
};

export const Gpt51ChatIcon: CompoundIcon = Object.assign(Gpt51Chat, {
  Avatar: Gpt51ChatAvatar,
  colorPrimary: '#000000',
});

export default Gpt51ChatIcon;
