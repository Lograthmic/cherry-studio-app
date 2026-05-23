import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt5NanoAvatar } from './avatar';
import { Gpt5NanoLight as Gpt5NanoDark } from './light';
import { Gpt5NanoLight } from './light';

const Gpt5Nano = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt5NanoDark : Gpt5NanoLight;

  return <Icon {...props} />;
};

export const Gpt5NanoIcon: CompoundIcon = Object.assign(Gpt5Nano, {
  Avatar: Gpt5NanoAvatar,
  colorPrimary: '#000000',
});

export default Gpt5NanoIcon;
