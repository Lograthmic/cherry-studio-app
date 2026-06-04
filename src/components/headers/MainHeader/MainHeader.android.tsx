import { MenuView } from '@expo/ui/community/menu';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';
import { MenuIcon, SquarePenIcon } from 'lucide-uniwind';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawerActions } from '@/components/drawer';

import { HeaderIconButton } from '../components/HeaderIconButton';
import type { MainHeaderProps } from './MainHeader.types';

export function MainHeader({ menuActions = [], onPressMenuAction, topicName }: MainHeaderProps) {
  const { t } = useTranslation();
  const { openDrawer } = useDrawerActions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const separatorColor = useThemeColor('separator');
  const resolvedTopicName = topicName?.trim();
  const title = resolvedTopicName ? resolvedTopicName : t('navigation.newChat');
  const resolvedMenuActions =
    menuActions.length > 0
      ? menuActions
      : ([
          { id: 'edit-assistant', image: 'pencil', title: t('chat.assistant.edit') },
        ] satisfies MainHeaderProps['menuActions']);

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
          <MenuView
            actions={resolvedMenuActions}
            onPressAction={onPressMenuAction}
            style={{ flex: 1, maxWidth: 224 }}
          >
            <View
              accessibilityLabel={title}
              accessibilityRole="button"
              className="h-9 items-center justify-center px-3"
            >
              <Text
                className="text-center text-[17px] font-semibold text-foreground"
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
          </MenuView>
          <HeaderIconButton accessibilityLabel={t('navigation.newChat')} onPress={openNewTopic}>
            <SquarePenIcon className="size-6 text-foreground" strokeWidth={2} />
          </HeaderIconButton>
        </View>
      </View>
    </>
  );
}
