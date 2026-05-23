import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GrokAvatar } from './avatar';
import { GrokDark } from './dark';
import { GrokLight } from './light';

const Grok = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GrokDark : GrokLight;

  return <Icon {...props} />;
};

export const GrokIcon: CompoundIcon = Object.assign(Grok, {
  Avatar: GrokAvatar,
  colorPrimary: '#000000',
});

export default GrokIcon;
