import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import type { ModelPickerTag } from '../utils/modelPickerData';
import { ModelPickerTagChip } from './ModelPickerTagChip';

type ModelPickerFilterTagBarProps = {
  availableTags: readonly ModelPickerTag[];
  onToggleTag: (tag: ModelPickerTag) => void;
  selectedTags: readonly ModelPickerTag[];
};

export function ModelPickerFilterTagBar({
  availableTags,
  onToggleTag,
  selectedTags,
}: ModelPickerFilterTagBarProps) {
  const { t } = useTranslation();
  const selectedTagSet = useMemo(() => new Set(selectedTags), [selectedTags]);

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <View className="mt-3 flex-row items-center gap-2">
      <Text className="shrink-0 text-default-foreground text-xs">{t('models.filter.by_tag')}</Text>
      <ScrollView
        alwaysBounceHorizontal={false}
        className="min-w-0 flex-1"
        contentContainerClassName="gap-1.5"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {availableTags.map((tag) => (
          <ModelPickerTagChip
            isActive={selectedTagSet.has(tag)}
            key={`model-picker-filter-${tag}`}
            showLabel
            size="md"
            tag={tag}
            onPress={() => onToggleTag(tag)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
