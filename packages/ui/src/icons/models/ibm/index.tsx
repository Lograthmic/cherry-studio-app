import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { IbmAvatar } from './avatar';
import { IbmLight as IbmDark } from './light';
import { IbmLight } from './light';

const Ibm = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? IbmDark : IbmLight;

  return <Icon {...props} />;
};

export const IbmIcon: CompoundIcon = Object.assign(Ibm, {
  Avatar: IbmAvatar,
  colorPrimary: '#DFE9F3',
});

export default IbmIcon;
