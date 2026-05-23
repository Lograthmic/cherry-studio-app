import { CheckIcon } from 'lucide-uniwind';
import { ScrollView, View } from 'react-native';

import { SettingsSection } from '@/components/settings';
import type { ModelSettingOption } from './utils/modelSettings';

type ModelPickerSheetContentProps = {
  onSelect: (option: ModelSettingOption) => void;
  options: readonly ModelSettingOption[];
  selectedModelId: string | null;
};

export function ModelPickerSheetContent({
  onSelect,
  options,
  selectedModelId,
}: ModelPickerSheetContentProps) {
  return (
    <ScrollView
      alwaysBounceVertical={false}
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 py-5">
        <SettingsSection
          items={options.map((option) => ({
            accessory:
              option.id === selectedModelId ? (
                <CheckIcon className="size-6 text-default-foreground" strokeWidth={2} />
              ) : undefined,
            hideAccessory: option.id !== selectedModelId,
            title: option.label,
            onPress: () => onSelect(option),
          }))}
        />
      </View>
    </ScrollView>
  );
}
