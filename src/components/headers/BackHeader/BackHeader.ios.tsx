import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { HeaderToolbarAction } from './BackHeader.types';

export type BackHeaderProps = {
  onBack?: () => void;
  rightActions?: readonly HeaderToolbarAction[];
  title?: string;
};

export function BackHeader({ onBack, rightActions, title = '' }: BackHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const goBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }

    router.back();
  }, [onBack, router]);

  const options = useMemo(
    () => ({
      headerBackVisible: false,
      title,
    }),
    [title],
  );

  return (
    <>
      <Stack.Screen options={options} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          accessibilityLabel={t('navigation.back')}
          icon="chevron.left"
          onPress={goBack}
        />
      </Stack.Toolbar>
      {rightActions && rightActions.length > 0 ? (
        <Stack.Toolbar placement="right">
          {rightActions.map(({ androidIcon: _androidIcon, key, ...action }) => (
            <Stack.Toolbar.Button key={key} {...action} />
          ))}
        </Stack.Toolbar>
      ) : null}
    </>
  );
}
