import { ClipPath, Defs, G, Path, Rect, Svg } from 'react-native-svg';

import { useIconProps } from '../icon-style';
import type { IconComponent } from '../types';

const OpenCode: IconComponent = ({ className, ...props }) => {
  const iconProps = useIconProps(className, props);

  return (
    <Svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" {...iconProps}>
      <G clipPath="url(#clip0_20_634)">
    <Path fillRule="evenodd" clipRule="evenodd" d="M77.2 34.2H42.8V85.8H77.2V34.2ZM94.4 103H25.6V17H94.4V103Z" fill="black" />
  </G>
  <Defs>
    <ClipPath id="clip0_20_634">
      <Rect width={86} height={86} fill="white" transform="translate(17 17)" />
    </ClipPath>
  </Defs>
    </Svg>
  );
};

export { OpenCode };
export default OpenCode;
