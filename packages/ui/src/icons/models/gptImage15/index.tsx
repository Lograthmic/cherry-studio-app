import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GptImage15Avatar } from './avatar';
import { GptImage15Light as GptImage15Dark } from './light';
import { GptImage15Light } from './light';

const GptImage15 = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GptImage15Dark : GptImage15Light;

  return <Icon {...props} />;
};

export const GptImage15Icon: CompoundIcon = Object.assign(GptImage15, {
  Avatar: GptImage15Avatar,
  colorPrimary: '#000000',
});

export default GptImage15Icon;
