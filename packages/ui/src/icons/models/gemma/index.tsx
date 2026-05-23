import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GemmaAvatar } from './avatar';
import { GemmaLight as GemmaDark } from './light';
import { GemmaLight } from './light';

const Gemma = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GemmaDark : GemmaLight;

  return <Icon {...props} />;
};

export const GemmaIcon: CompoundIcon = Object.assign(Gemma, {
  Avatar: GemmaAvatar,
  colorPrimary: '#53A3FF',
});

export default GemmaIcon;
