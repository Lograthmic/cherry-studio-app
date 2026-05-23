import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { GptOss20bAvatar } from './avatar';
import { GptOss20bLight as GptOss20bDark } from './light';
import { GptOss20bLight } from './light';

const GptOss20b = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? GptOss20bDark : GptOss20bLight;

  return <Icon {...props} />;
};

export const GptOss20bIcon: CompoundIcon = Object.assign(GptOss20b, {
  Avatar: GptOss20bAvatar,
  colorPrimary: '#000000',
});

export default GptOss20bIcon;
