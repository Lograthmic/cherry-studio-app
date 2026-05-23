import { Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';

import { isIOS, isLiquidGlassAvailable } from '@/config/constants';

export default function SettingsStackLayout() {
  const [backgroundColor, foregroundColor] = useThemeColor(['background', 'foreground']);

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor,
        },
        headerShadowVisible: isIOS ? undefined : false,
        headerStyle: isIOS
          ? undefined
          : {
              backgroundColor,
            },
        headerTransparent: isLiquidGlassAvailable,
        headerTintColor: foregroundColor,
      }}
    />
  );
}
