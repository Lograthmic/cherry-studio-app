import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt5Avatar } from './avatar';
import { Gpt5Light as Gpt5Dark } from './light';
import { Gpt5Light } from './light';

const Gpt5 = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt5Dark : Gpt5Light;

  return <Icon {...props} />;
};

export const Gpt5Icon: CompoundIcon = Object.assign(Gpt5, {
  Avatar: Gpt5Avatar,
  colorPrimary: '#000000',
});

export default Gpt5Icon;
