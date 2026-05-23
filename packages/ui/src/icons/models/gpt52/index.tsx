import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt52Avatar } from './avatar';
import { Gpt52Light as Gpt52Dark } from './light';
import { Gpt52Light } from './light';

const Gpt52 = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt52Dark : Gpt52Light;

  return <Icon {...props} />;
};

export const Gpt52Icon: CompoundIcon = Object.assign(Gpt52, {
  Avatar: Gpt52Avatar,
  colorPrimary: '#000000',
});

export default Gpt52Icon;
