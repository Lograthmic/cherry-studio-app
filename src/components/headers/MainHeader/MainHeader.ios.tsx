import { MenuView } from '@expo/ui/community/menu';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useDrawerActions } from '@/components/drawer';

import type { MainHeaderProps } from './MainHeader.types';

export function MainHeader({ menuActions = [], onPressMenuAction, topicName }: MainHeaderProps) {
  const { t } = useTranslation();
  const { openDrawer } = useDrawerActions();
  const router = useRouter();
  const foregroundColor = useThemeColor('foreground');
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
      <Stack.Screen
        options={{
          headerBackVisible: false,
          title,
          headerTitle: () => (
            <MenuView actions={resolvedMenuActions} onPressAction={onPressMenuAction}>
              <View
                accessibilityLabel={title}
                accessibilityRole="button"
                style={{
                  alignItems: 'center',
                  height: 36,
                  justifyContent: 'center',
                  maxWidth: 220,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: foregroundColor,
                    fontSize: 17,
                    fontWeight: '600',
                    maxWidth: 220,
                    textAlign: 'center',
                  }}
                >
                  {title}
                </Text>
              </View>
            </MenuView>
          ),
          headerTransparent: true,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          accessibilityLabel={t('navigation.openSidebar')}
          icon="sidebar.left"
          onPress={openDrawer}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={t('navigation.newChat')}
          icon="square.and.pencil"
          onPress={openNewTopic}
        />
      </Stack.Toolbar>
    </>
  );
}
