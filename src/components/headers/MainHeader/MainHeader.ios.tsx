import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawerActions } from '@/components/drawer';

export function MainHeader() {
  const { t } = useTranslation();
  const { openDrawer } = useDrawerActions();
  const router = useRouter();

  const openNewTopic = useCallback(() => {
    router.setParams({ topicId: undefined });
  }, [router]);

  const openEditAssistant = useCallback(() => undefined, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerBackVisible: false,
          headerTitle: '',
          title: '',
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
        <Stack.Toolbar.Menu accessibilityLabel={t('common.more')} icon="ellipsis">
          <Stack.Toolbar.MenuAction icon="pencil" onPress={openEditAssistant}>
            {t('chat.assistant.edit')}
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
    </>
  );
}
