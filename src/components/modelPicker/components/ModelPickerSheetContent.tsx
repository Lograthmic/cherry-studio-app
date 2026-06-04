import { useThemeColor } from 'heroui-native/hooks';
import { cn } from 'heroui-native/utils';
import { Pin as NativePinIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import type { ModelPickerGroup, ModelPickerModelItem } from '../utils/modelPickerData';
import { getModelPickerTags } from '../utils/modelPickerData';
import { ModelPickerIcon } from './ModelPickerIcon';
import { ModelPickerTagChip } from './ModelPickerTagChip';

type ModelPickerSheetContentProps = {
  emptyText?: string;
  groups: readonly ModelPickerGroup[];
  isLoading?: boolean;
  isPinActionDisabled?: boolean;
  isSearching: boolean;
  loadingText?: string;
  onSelect: (item: ModelPickerModelItem) => void;
  onTogglePin: (modelId: ModelPickerModelItem['modelId']) => Promise<void> | void;
  pinnedModelIds: readonly string[];
  selectedModelId: string | null;
};

export function ModelPickerSheetContent({
  emptyText,
  groups,
  isLoading = false,
  isPinActionDisabled = false,
  loadingText,
  onSelect,
  onTogglePin,
  pinnedModelIds,
  selectedModelId,
}: ModelPickerSheetContentProps) {
  const { t } = useTranslation();

  if (groups.length === 0) {
    return (
      <View className="px-4 pb-5 pt-3">
        <View className="min-h-12 items-center justify-center rounded-xl bg-settings-grouped-surface px-4 py-4">
          <Text className="text-base text-default-foreground">
            {isLoading ? loadingText : emptyText}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-3 px-4 pb-5 pt-3">
      {groups.map((group) => (
        <View className="gap-1" key={group.key}>
          <View className="flex-row items-center gap-2 px-1">
            <Text className="font-medium text-default-foreground text-sm">
              {group.groupKind === 'pinned' ? t(group.title) : group.title}
            </Text>
            {group.groupKind === 'pinned' ? (
              <Text className="text-default-foreground text-sm">{group.items.length}</Text>
            ) : null}
          </View>
          <View className="overflow-hidden rounded-xl">
            {group.items.map((item) => (
              <ModelPickerRow
                isPinned={pinnedModelIds.includes(item.modelId)}
                isPinActionDisabled={isPinActionDisabled}
                isSelected={item.modelId === selectedModelId}
                item={item}
                key={item.key}
                onSelect={onSelect}
                onTogglePin={onTogglePin}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function ModelPickerRow({
  isPinned,
  isPinActionDisabled,
  isSelected,
  item,
  onSelect,
  onTogglePin,
}: {
  isPinned: boolean;
  isPinActionDisabled: boolean;
  isSelected: boolean;
  item: ModelPickerModelItem;
  onSelect: (item: ModelPickerModelItem) => void;
  onTogglePin: (modelId: ModelPickerModelItem['modelId']) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const defaultForegroundColor = useThemeColor('default-foreground');
  const pinColor = defaultForegroundColor;
  const tags = useMemo(() => getModelPickerTags(item.model), [item.model]);

  return (
    <Pressable
      accessibilityLabel={item.model.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={cn(
        'flex-row items-center gap-3 px-3 py-2 active:opacity-60',
        isSelected ? 'bg-settings-grouped-surface' : 'bg-transparent',
      )}
      onPress={() => onSelect(item)}
    >
      <ModelPickerIcon item={item} />
      <View className="min-w-0 flex-1 gap-1">
        <View className="min-w-0 flex-row items-center gap-2">
          <Text className="min-w-0 shrink text-base text-foreground" numberOfLines={1}>
            {item.model.name}
          </Text>
          {isPinned ? (
            <Text className="shrink text-base text-default-foreground" numberOfLines={1}>
              | {item.provider.name}
            </Text>
          ) : null}
        </View>
        <View className="min-h-5 flex-row items-center gap-1">
          {tags.slice(0, 4).map((tag) => (
            <ModelPickerTagChip key={`${item.key}:${tag}`} tag={tag} />
          ))}
        </View>
      </View>
      <Pressable
        accessibilityLabel={t(isPinned ? 'models.action.unpin' : 'models.action.pin')}
        accessibilityRole="button"
        accessibilityState={{ disabled: isPinActionDisabled, selected: isPinned }}
        className="size-8 items-center justify-center rounded-xl active:bg-surface-secondary active:opacity-70 disabled:opacity-40"
        disabled={isPinActionDisabled}
        hitSlop={6}
        onPress={(event) => {
          event.stopPropagation();
          void onTogglePin(item.modelId);
        }}
      >
        <View className={isPinned ? 'rotate-45' : undefined}>
          <NativePinIcon color={pinColor} height={16} strokeWidth={2} width={16} />
        </View>
      </Pressable>
    </Pressable>
  );
}
