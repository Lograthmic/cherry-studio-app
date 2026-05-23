import { ClipPath, Defs, G, Path, Rect, Svg } from 'react-native-svg';

import { useIconProps } from '../icon-style';
import type { IconComponent } from '../types';

const ClaudeCode: IconComponent = ({ className, ...props }) => {
  const iconProps = useIconProps(className, props);

  return (
    <Svg viewBox="0 0 120 120" fill="none" width="1em" height="1em" {...iconProps}>
      <G clipPath="url(#clip0_20_611)">
    <Path fillRule="evenodd" clipRule="evenodd" d="M91.7428 55.7339H102.5V66.8494H91.75V77.6998H86.4216V88.1667H81V77.6998H75.6716V88.1667H70.25V77.6998H48.75V88.1667H43.332V77.6998H38V88.1667H32.5784V77.6998H27.25V66.8458H16.5V55.7375H27.25V34.4167H91.7428V55.7339ZM38 55.7339H43.332V45.5322H38V55.7339ZM75.6608 55.7339H81V45.5322H75.6608V55.7339Z" fill="#D97757" />
  </G>
  <Defs>
    <ClipPath id="clip0_20_611">
      <Rect width={86} height={86} fill="white" transform="translate(16.5 16.5)" />
    </ClipPath>
  </Defs>
    </Svg>
  );
};

export { ClaudeCode };
export default ClaudeCode;
