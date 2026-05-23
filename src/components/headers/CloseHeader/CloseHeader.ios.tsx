import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type CloseHeaderProps = {
  title?: string;
};

export function CloseHeader({ title = '' }: CloseHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const close = useCallback(() => {
    router.back();
  }, [router]);

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
        <Stack.Toolbar.Button accessibilityLabel={t('common.close')} icon="xmark" onPress={close} />
      </Stack.Toolbar>
    </>
  );
}
