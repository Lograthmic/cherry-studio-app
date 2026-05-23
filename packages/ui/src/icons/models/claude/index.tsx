import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { ClaudeAvatar } from './avatar';
import { ClaudeLight as ClaudeDark } from './light';
import { ClaudeLight } from './light';

const Claude = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? ClaudeDark : ClaudeLight;

  return <Icon {...props} />;
};

export const ClaudeIcon: CompoundIcon = Object.assign(Claude, {
  Avatar: ClaudeAvatar,
  colorPrimary: '#d97757',
});

export default ClaudeIcon;
