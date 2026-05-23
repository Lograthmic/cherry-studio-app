import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { Gpt51CodexMiniAvatar } from './avatar';
import { Gpt51CodexMiniLight as Gpt51CodexMiniDark } from './light';
import { Gpt51CodexMiniLight } from './light';

const Gpt51CodexMini = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? Gpt51CodexMiniDark : Gpt51CodexMiniLight;

  return <Icon {...props} />;
};

export const Gpt51CodexMiniIcon: CompoundIcon = Object.assign(Gpt51CodexMini, {
  Avatar: Gpt51CodexMiniAvatar,
  colorPrimary: '#000000',
});

export default Gpt51CodexMiniIcon;
