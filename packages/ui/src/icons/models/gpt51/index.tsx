import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt51Avatar } from './avatar';
import { Gpt51Light as Gpt51Dark } from './light';
import { Gpt51Light } from './light';

const Gpt51 = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt51Dark : Gpt51Light;

  return <Icon {...props} />;
};

export const Gpt51Icon: CompoundIcon = Object.assign(Gpt51, {
  Avatar: Gpt51Avatar,
  colorPrimary: '#000000',
});

export default Gpt51Icon;
