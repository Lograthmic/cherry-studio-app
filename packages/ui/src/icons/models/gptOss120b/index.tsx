import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GptOss120bAvatar } from './avatar';
import { GptOss120bLight as GptOss120bDark } from './light';
import { GptOss120bLight } from './light';

const GptOss120b = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GptOss120bDark : GptOss120bLight;

  return <Icon {...props} />;
};

export const GptOss120bIcon: CompoundIcon = Object.assign(GptOss120b, {
  Avatar: GptOss120bAvatar,
  colorPrimary: '#000000',
});

export default GptOss120bIcon;
