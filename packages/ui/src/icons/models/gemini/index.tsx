import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GeminiAvatar } from './avatar';
import { GeminiLight as GeminiDark } from './light';
import { GeminiLight } from './light';

const Gemini = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GeminiDark : GeminiLight;

  return <Icon {...props} />;
};

export const GeminiIcon: CompoundIcon = Object.assign(Gemini, {
  Avatar: GeminiAvatar,
  colorPrimary: '#F6C013',
});

export default GeminiIcon;
