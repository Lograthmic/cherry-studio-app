import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { CodegeexAvatar } from './avatar';
import { CodegeexLight as CodegeexDark } from './light';
import { CodegeexLight } from './light';

const Codegeex = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? CodegeexDark : CodegeexLight;

  return <Icon {...props} />;
};

export const CodegeexIcon: CompoundIcon = Object.assign(Codegeex, {
  Avatar: CodegeexAvatar,
  colorPrimary: '#171E1E',
});

export default CodegeexIcon;
