import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { HunyuanAvatar } from './avatar';
import { HunyuanLight as HunyuanDark } from './light';
import { HunyuanLight } from './light';

const Hunyuan = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? HunyuanDark : HunyuanLight;

  return <Icon {...props} />;
};

export const HunyuanIcon: CompoundIcon = Object.assign(Hunyuan, {
  Avatar: HunyuanAvatar,
  colorPrimary: '#0054E0',
});

export default HunyuanIcon;
