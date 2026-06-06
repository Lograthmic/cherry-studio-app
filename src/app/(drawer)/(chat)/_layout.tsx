import { Stack } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';

import { isIOS, isLiquidGlassAvailable } from '@/config/constants';
import { ChatRuntimeProvider } from '@/screens/ChatScreen/runtime';

export default function ChatStackLayout() {
  const foregroundColor = useThemeColor('foreground');

  return (
    <ChatRuntimeProvider>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: 'transparent',
          },
          headerShadowVisible: isIOS ? undefined : false,
          headerStyle: isIOS
            ? undefined
            : {
                backgroundColor: 'transparent',
              },
          headerTransparent: isLiquidGlassAvailable,
          headerTintColor: foregroundColor,
        }}
      />
    </ChatRuntimeProvider>
  );
}
