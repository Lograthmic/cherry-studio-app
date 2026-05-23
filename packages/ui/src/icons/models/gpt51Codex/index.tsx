import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt51CodexAvatar } from './avatar';
import { Gpt51CodexLight as Gpt51CodexDark } from './light';
import { Gpt51CodexLight } from './light';

const Gpt51Codex = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt51CodexDark : Gpt51CodexLight;

  return <Icon {...props} />;
};

export const Gpt51CodexIcon: CompoundIcon = Object.assign(Gpt51Codex, {
  Avatar: Gpt51CodexAvatar,
  colorPrimary: '#000000',
});

export default Gpt51CodexIcon;
