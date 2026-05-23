import { Path, Svg } from 'react-native-svg';

import { useIconProps } from '../../icon-style';
import type { IconComponent } from '../../types';

const TrinityDark: IconComponent = ({ className, ...props }) => {
  const iconProps = useIconProps(className, props);

  return (
    <Svg viewBox="0 0 32 32" fill="none" width="1em" height="1em" {...iconProps}>
      <Path d="M15.68 2.88L30.4 28.48H0.959961L15.68 2.88ZM15.68 2.88V20.1263M15.68 20.1263L0.996196 28.48M15.68 20.1263L30.3637 28.48" stroke="white" strokeWidth={1.92} strokeMiterlimit={10} strokeLinejoin="round" />
    </Svg>
  );
};

export { TrinityDark };
export default TrinityDark;
