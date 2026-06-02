import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';
import { MenuIcon, SquarePenIcon } from 'lucide-uniwind';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawerActions } from '@/components/drawer';

import { HeaderIconButton } from '../components/HeaderIconButton';

export function MainHeader() {
  const { t } = useTranslation();
  const { openDrawer } = useDrawerActions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const separatorColor = useThemeColor('separator');

  const openNewTopic = useCallback(() => {
    router.setParams({ topicId: undefined });
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{ borderBottomColor: separatorColor, borderBottomWidth: StyleSheet.hairlineWidth }}
      >
        <View style={{ height: insets.top }} />
        <View className="h-11 flex-row items-center justify-between px-4">
          <HeaderIconButton accessibilityLabel={t('navigation.openSidebar')} onPress={openDrawer}>
            <MenuIcon className="size-6 text-foreground" strokeWidth={2} />
          </HeaderIconButton>
          <HeaderIconButton accessibilityLabel={t('navigation.newChat')} onPress={openNewTopic}>
            <SquarePenIcon className="size-6 text-foreground" strokeWidth={2} />
          </HeaderIconButton>
        </View>
      </View>
    </>
  );
}
