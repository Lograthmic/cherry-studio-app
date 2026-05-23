import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GlmAvatar } from './avatar';
import { GlmLight as GlmDark } from './light';
import { GlmLight } from './light';

const Glm = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GlmDark : GlmLight;

  return <Icon {...props} />;
};

export const GlmIcon: CompoundIcon = Object.assign(Glm, {
  Avatar: GlmAvatar,
  colorPrimary: '#5072E9',
});

export default GlmIcon;
