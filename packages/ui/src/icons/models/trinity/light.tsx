import { Path, Svg } from 'react-native-svg';

import { useIconProps } from '../../icon-style';
import type { IconComponent } from '../../types';

const TrinityLight: IconComponent = ({ className, ...props }) => {
  const iconProps = useIconProps(className, props);

  return (
    <Svg viewBox="0 0 25 22" fill="none" width="1em" height="1em" {...iconProps}>
      <Path d="M12.25 0.75L23.75 20.75H0.75L12.25 0.75ZM12.25 0.75L12.25 14.2237M0.778309 20.75L12.25 14.2237M12.25 14.2237L23.7217 20.75" stroke="currentColor" strokeWidth={1.5} strokeMiterlimit={10} strokeLinejoin="round"></Path>
    </Svg>
  );
};

export { TrinityLight };
export default TrinityLight;
