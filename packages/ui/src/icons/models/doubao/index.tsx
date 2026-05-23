import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { DoubaoAvatar } from './avatar';
import { DoubaoLight as DoubaoDark } from './light';
import { DoubaoLight } from './light';

const Doubao = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? DoubaoDark : DoubaoLight;

  return <Icon {...props} />;
};

export const DoubaoIcon: CompoundIcon = Object.assign(Doubao, {
  Avatar: DoubaoAvatar,
  colorPrimary: '#1E37FC',
});

export default DoubaoIcon;
