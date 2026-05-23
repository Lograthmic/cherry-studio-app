import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt5CodexAvatar } from './avatar';
import { Gpt5CodexLight as Gpt5CodexDark } from './light';
import { Gpt5CodexLight } from './light';

const Gpt5Codex = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt5CodexDark : Gpt5CodexLight;

  return <Icon {...props} />;
};

export const Gpt5CodexIcon: CompoundIcon = Object.assign(Gpt5Codex, {
  Avatar: Gpt5CodexAvatar,
  colorPrimary: '#000000',
});

export default Gpt5CodexIcon;
