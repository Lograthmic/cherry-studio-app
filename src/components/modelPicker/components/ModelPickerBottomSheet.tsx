import {
  BottomSheet,
  type BottomSheetMethods,
  BottomSheetView,
} from '@expo/ui/community/bottom-sheet';
import { SearchField } from 'heroui-native/search-field';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type ModelPickerModelItem,
  type ModelPickerTag,
} from '../utils/modelPickerData';
import { useModelPickerData } from '../hooks/useModelPickerData';
import { ModelPickerFilterTagBar } from './ModelPickerFilterTagBar';
import { ModelPickerSheetContent } from './ModelPickerSheetContent';

const modelPickerSnapPoints = ['85%'];
const modelPickerSnapPointFraction = 0.85;
const defaultModelPickerHeaderHeight = 96;

type ModelPickerBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: ModelPickerModelItem) => void;
  selectedModelId: string | null;
};

export function ModelPickerBottomSheet({
  isOpen,
  onClose,
  onSelect,
  selectedModelId,
}: ModelPickerBottomSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [searchText, setSearchText] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedTags, setSelectedTags] = useState<ModelPickerTag[]>([]);
  const isSearching = searchText.trim().length > 0;
  const sheetHeight = (windowHeight - insets.top - insets.bottom) * modelPickerSnapPointFraction;
  const modelListHeight = Math.max(
    sheetHeight - (headerHeight || defaultModelPickerHeaderHeight),
    120,
  );
  const {
    availableTags,
    groups,
    isLoading,
    isPinActionDisabled,
    pinnedModelIds,
    togglePin,
  } = useModelPickerData({ searchText, selectedTags });

  const handleSelect = useCallback(
    (item: ModelPickerModelItem) => {
      onSelect(item);
      sheetRef.current?.close();
    },
    [onSelect],
  );
  const handleTogglePin = useCallback(
    (modelId: ModelPickerModelItem['modelId']) => togglePin(modelId),
    [togglePin],
  );
  const handleToggleTag = useCallback((tag: ModelPickerTag) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((selectedTag) => selectedTag !== tag) : [...current, tag],
    );
  }, []);
  const handleClose = useCallback(() => {
    setSearchText('');
    setSelectedTags([]);
    onClose();
  }, [onClose]);
  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setHeaderHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  }, []);

  return (
    <BottomSheet
      enablePanDownToClose
      enableDynamicSizing={false}
      handleComponent={null}
      index={isOpen ? 0 : -1}
      ref={sheetRef}
      snapPoints={modelPickerSnapPoints}
      onClose={handleClose}
    >
      <BottomSheetView style={styles.sheetContent}>
        <View style={[styles.sheetViewport, { height: sheetHeight }]}>
          <View className="px-4 pt-5" onLayout={handleHeaderLayout}>
            <SearchField className="w-full" onChange={setSearchText} value={searchText}>
              <SearchField.Group className="h-10 rounded-xl bg-settings-grouped-surface">
                <SearchField.SearchIcon iconProps={{ size: 18 }} />
                <SearchField.Input
                  accessibilityLabel={t('navigation.search')}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  className="h-10 min-h-10 rounded-xl border-0 bg-transparent py-0 pl-9 pr-10 text-base leading-5"
                  placeholder={t('navigation.search')}
                  returnKeyType="search"
                  spellCheck={false}
                  style={styles.searchInput}
                  textContentType="none"
                />
                <SearchField.ClearButton
                  accessibilityLabel={t('common.clear')}
                  className="right-1"
                />
              </SearchField.Group>
            </SearchField>
            <ModelPickerFilterTagBar
              availableTags={availableTags}
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />
          </View>
          <View
            style={[styles.modelListViewport, { height: modelListHeight }]}
          >
            <ScrollView
              alwaysBounceVertical={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.modelListScrollView}
            >
              <ModelPickerSheetContent
                emptyText={t('settings.provider.models.search.empty')}
                groups={groups}
                isLoading={isLoading}
                isPinActionDisabled={isPinActionDisabled}
                isSearching={isSearching}
                loadingText={t('settings.provider.models.loading')}
                pinnedModelIds={pinnedModelIds}
                selectedModelId={selectedModelId}
                onSelect={handleSelect}
                onTogglePin={handleTogglePin}
              />
            </ScrollView>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  modelListViewport: {
    flex: 1,
    minHeight: 0,
  },
  modelListScrollView: {
    flex: 1,
  },
  sheetContent: {
    flex: 1,
  },
  sheetViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  searchInput: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
