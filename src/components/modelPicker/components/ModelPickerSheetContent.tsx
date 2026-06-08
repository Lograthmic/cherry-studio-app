import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { useThemeColor } from 'heroui-native/hooks';
import { cn } from 'heroui-native/utils';
import { PinIcon as NativePinIcon } from 'lucide-uniwind/png';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ModelPickerGroup, ModelPickerModelItem } from '../utils/modelPickerData';
import { getModelPickerTags } from '../utils/modelPickerData';
import type { ModelPickerListItem } from '../utils/modelPickerListItems';
import { ModelPickerIcon } from './ModelPickerIcon';
import { ModelPickerTagChip } from './ModelPickerTagChip';

const modelPickerEstimatedItemSize = 64;

type ModelPickerSheetContentProps = {
  emptyText?: string;
  hasMoreItems?: boolean;
  isLoading?: boolean;
  isPinActionDisabled?: boolean;
  isSearching: boolean;
  listItems: readonly ModelPickerListItem[];
  loadingText?: string;
  onEndReached?: () => void;
  onSelect: (item: ModelPickerModelItem) => void;
  onTogglePin: (modelId: ModelPickerModelItem['modelId']) => Promise<void> | void;
  pinnedModelIds: readonly string[];
  selectedModelId: string | null;
};

type ModelPickerSheetContentExtraData = {
  isPinActionDisabled: boolean;
  pinnedModelIdSet: ReadonlySet<string>;
  selectedModelId: string | null;
};

export function ModelPickerSheetContent({
  emptyText,
  hasMoreItems = false,
  isLoading = false,
  isPinActionDisabled = false,
  listItems,
  loadingText,
  onEndReached,
  onSelect,
  onTogglePin,
  pinnedModelIds,
  selectedModelId,
}: ModelPickerSheetContentProps) {
  const pinnedModelIdSet = useMemo(() => new Set(pinnedModelIds), [pinnedModelIds]);
  const listExtraData = useMemo<ModelPickerSheetContentExtraData>(
    () => ({
      isPinActionDisabled,
      pinnedModelIdSet,
      selectedModelId,
    }),
    [isPinActionDisabled, pinnedModelIdSet, selectedModelId],
  );
  const renderItem = useCallback(
    ({ extraData, item }: LegendListRenderItemProps<ModelPickerListItem>) => {
      if (item.type === 'groupHeader') {
        return (
          <ModelPickerGroupHeader
            count={item.count}
            groupKind={item.groupKind}
            isFirstGroup={item.isFirstGroup}
            title={item.title}
          />
        );
      }

      return (
        <ModelPickerRow
          isPinned={extraData.pinnedModelIdSet.has(item.item.modelId)}
          isPinActionDisabled={extraData.isPinActionDisabled}
          isSelected={item.item.modelId === extraData.selectedModelId}
          item={item.item}
          onSelect={onSelect}
          onTogglePin={onTogglePin}
        />
      );
    },
    [onSelect, onTogglePin],
  );
  const keyExtractor = useCallback((item: ModelPickerListItem) => item.key, []);
  const getItemType = useCallback((item: ModelPickerListItem) => item.type, []);
  const handleEndReached = useCallback(() => {
    if (!hasMoreItems) {
      return;
    }

    onEndReached?.();
  }, [hasMoreItems, onEndReached]);

  if (listItems.length === 0) {
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
    <LegendList
      contentContainerStyle={styles.listContentContainer}
      data={listItems}
      drawDistance={320}
      estimatedItemSize={modelPickerEstimatedItemSize}
      extraData={listExtraData}
      getItemType={getItemType}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      keyExtractor={keyExtractor}
      maintainVisibleContentPosition={false}
      nestedScrollEnabled
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.15}
      recycleItems
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      style={styles.list}
    />
  );
}

function ModelPickerGroupHeader({
  count,
  groupKind,
  isFirstGroup,
  title,
}: {
  count: number;
  groupKind: ModelPickerGroup['groupKind'];
  isFirstGroup: boolean;
  title: string;
}) {
  const { t } = useTranslation();

  return (
    <View className={cn('mx-4 flex-row items-center gap-2 px-1 pb-1', !isFirstGroup && 'mt-3')}>
      <Text className="font-medium text-default-foreground text-sm">
        {groupKind === 'pinned' ? t(title) : title}
      </Text>
      {groupKind === 'pinned' ? (
        <Text className="text-default-foreground text-sm">{count}</Text>
      ) : null}
    </View>
  );
}

const ModelPickerRow = memo(function ModelPickerRow({
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
  const handleSelect = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);
  const handleTogglePin = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      void onTogglePin(item.modelId);
    },
    [item.modelId, onTogglePin],
  );

  return (
    <Pressable
      accessibilityLabel={item.model.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={cn(
        'mx-4 flex-row items-center gap-3 rounded-xl px-3 py-2 active:opacity-60',
        isSelected ? 'bg-settings-grouped-surface' : 'bg-transparent',
      )}
      onPress={handleSelect}
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
        onPress={handleTogglePin}
      >
        <View className={isPinned ? 'rotate-45' : undefined}>
          <NativePinIcon color={pinColor} height={16} strokeWidth={2} width={16} />
        </View>
      </Pressable>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
    paddingTop: 12,
  },
});
