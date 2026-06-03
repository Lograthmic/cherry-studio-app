import { useThemeColor } from 'heroui-native/hooks';
import { Spinner } from 'heroui-native/spinner';
import { ActivityIcon, DownloadIcon, PlusIcon } from 'lucide-uniwind';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

type ProviderModelToolbarProps = {
  isPullDisabled?: boolean;
  isPullLoading?: boolean;
  onPullPress?: () => void;
};

export function ProviderModelToolbar({
  isPullDisabled = false,
  isPullLoading = false,
  onPullPress,
}: ProviderModelToolbarProps) {
  const { t } = useTranslation();
  const foregroundColor = useThemeColor('foreground');

  return (
    <View className="flex-row items-center justify-between gap-3 px-1">
      <Text className="font-medium text-default-foreground text-sm">
        {t('settings.provider.models.title')}
      </Text>
      <View className="flex-row items-center gap-2">
        <ModelIconActionButton
          accessibilityLabel={t('settings.provider.models.activity')}
          icon={<ActivityIcon className="size-4 text-default-foreground" strokeWidth={2} />}
        />
        <ModelActionButton
          accessibilityLabel={t('settings.provider.models.pull')}
          icon={
            isPullLoading ? (
              <Spinner color={foregroundColor} size="sm" />
            ) : (
              <DownloadIcon
                className={
                  isPullDisabled ? 'size-4 text-default-foreground' : 'size-4 text-foreground'
                }
                strokeWidth={2}
              />
            )
          }
          isDisabled={isPullDisabled}
          isLoading={isPullLoading}
          label={t('settings.provider.models.pull')}
          onPress={onPullPress}
        />
        <ModelActionButton
          accessibilityLabel={t('settings.provider.models.add')}
          icon={<PlusIcon className="size-4 text-default-foreground" strokeWidth={2} />}
          label={t('settings.provider.models.add')}
        />
      </View>
    </View>
  );
}

function ModelIconActionButton({
  accessibilityLabel,
  icon,
}: {
  accessibilityLabel: string;
  icon: ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="size-7 items-center justify-center active:opacity-60"
      hitSlop={6}
    >
      {icon}
    </Pressable>
  );
}

function ModelActionButton({
  accessibilityLabel,
  icon,
  isDisabled = false,
  isLoading = false,
  label,
  onPress,
}: {
  accessibilityLabel: string;
  icon: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: isDisabled }}
      className="h-7 flex-row items-center gap-1 rounded-xl bg-settings-grouped-surface px-2 active:opacity-60 disabled:opacity-40"
      disabled={isDisabled}
      hitSlop={6}
      onPress={onPress}
    >
      {icon}
      <Text className="font-medium text-default-foreground text-sm">{label}</Text>
    </Pressable>
  );
}
