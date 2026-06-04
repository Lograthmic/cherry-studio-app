import { Spinner } from 'heroui-native/spinner';
import { Pressable, Text, View } from 'react-native';

type SettingsDialogActionButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  isPrimary?: boolean;
  label: string;
  onPress: () => void;
};

export function SettingsDialogActionButton({
  isDisabled = false,
  isLoading = false,
  isPrimary = false,
  label,
  onPress,
}: SettingsDialogActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={
        isPrimary
          ? 'h-9 min-w-20 items-center justify-center rounded-xl bg-primary px-4 active:opacity-80 disabled:opacity-40'
          : 'h-9 min-w-20 items-center justify-center rounded-xl bg-settings-grouped-surface px-4 active:opacity-80 disabled:opacity-40'
      }
      disabled={isDisabled}
      onPress={onPress}
    >
      <View className="min-w-0 flex-row items-center justify-center gap-2 px-3">
        {isLoading ? <Spinner size="sm" /> : null}
        <Text
          className={
            isPrimary ? 'font-medium text-sm text-white' : 'font-medium text-foreground text-sm'
          }
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
