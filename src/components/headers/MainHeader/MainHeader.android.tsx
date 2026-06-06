import { MenuView } from '@expo/ui/community/menu';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';
import { EllipsisIcon, MenuIcon, SquarePenIcon } from 'lucide-uniwind';
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

  const openEditAssistant = useCallback(() => undefined, []);

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
          <View className="flex-row items-center">
            <HeaderIconButton accessibilityLabel={t('navigation.newChat')} onPress={openNewTopic}>
              <SquarePenIcon className="size-6 text-foreground" strokeWidth={2} />
            </HeaderIconButton>
            <MenuView
              actions={[{ id: 'edit-assistant', image: 'pencil', title: t('chat.assistant.edit') }]}
              onPressAction={openEditAssistant}
            >
              <HeaderIconButton accessibilityLabel={t('common.more')}>
                <EllipsisIcon className="size-6 text-foreground" strokeWidth={2} />
              </HeaderIconButton>
            </MenuView>
          </View>
        </View>
      </View>
    </>
  );
}
