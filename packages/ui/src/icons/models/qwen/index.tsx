import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { QwenAvatar } from './avatar';
import { QwenLight as QwenDark } from './light';
import { QwenLight } from './light';

const Qwen = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? QwenDark : QwenLight;

  return <Icon {...props} />;
};

export const QwenIcon: CompoundIcon = Object.assign(Qwen, {
  Avatar: QwenAvatar,
  colorPrimary: '#615CED',
});

export default QwenIcon;
