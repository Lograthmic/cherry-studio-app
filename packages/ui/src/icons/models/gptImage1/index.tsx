import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GptImage1Avatar } from './avatar';
import { GptImage1Light as GptImage1Dark } from './light';
import { GptImage1Light } from './light';

const GptImage1 = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GptImage1Dark : GptImage1Light;

  return <Icon {...props} />;
};

export const GptImage1Icon: CompoundIcon = Object.assign(GptImage1, {
  Avatar: GptImage1Avatar,
  colorPrimary: '#000000',
});

export default GptImage1Icon;
