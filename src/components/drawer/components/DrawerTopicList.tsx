import { LegendList, type LegendListRenderItemProps } from '@legendapp/list/react-native';
import { cn } from 'heroui-native/utils';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { Topic } from '@/data/types/topic';

import { useDrawerActions, useDrawerPanelState, useDrawerTopics } from '../context/DrawerProvider';
import { drawerContentLayoutTransition, drawerFeatureAreaEntering } from '../utils/drawerAnimation';

import { DrawerFeatureArea } from './DrawerFeatureArea';

type DrawerTopicRowProps = {
  isActive: boolean;
  onPress: (topicId: string) => void;
  showActiveBackground: boolean;
  topic: Topic;
};

type DrawerTopicListExtraData = {
  activeTopicId?: string;
  showActiveBackground: boolean;
};

const topicItemHeight = 44;

export const DrawerTopicList = memo(function DrawerTopicList() {
  const { t } = useTranslation();
  const { isSearchActive } = useDrawerPanelState();
  const { activeTopicId, isTopicListLoading, topics } = useDrawerTopics();
  const { loadMoreTopics, openTopic } = useDrawerActions();
  const listExtraData = useMemo<DrawerTopicListExtraData>(
    () => ({
      activeTopicId,
      showActiveBackground: !isSearchActive,
    }),
    [activeTopicId, isSearchActive],
  );

  const renderItem = useCallback(
    ({ extraData, item }: LegendListRenderItemProps<Topic>) => (
      <DrawerTopicRow
        isActive={item.id === extraData.activeTopicId}
        onPress={openTopic}
        showActiveBackground={extraData.showActiveBackground}
        topic={item}
      />
    ),
    [openTopic],
  );

  const listEmptyComponent = useCallback(
    () => (
      <View className="items-center justify-center px-6 py-8">
        {isTopicListLoading ? null : (
          <Text className="text-center text-default-foreground text-sm">
            {t('navigation.noMatchingChats')}
          </Text>
        )}
      </View>
    ),
    [isTopicListLoading, t],
  );

  return (
    <LegendList
      contentContainerStyle={{ paddingTop: 2 }}
      data={topics}
      estimatedItemSize={topicItemHeight}
      extraData={listExtraData}
      keyExtractor={(item) => item.id}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={listEmptyComponent}
      ListHeaderComponent={
        isSearchActive ? null : (
          <Animated.View
            entering={drawerFeatureAreaEntering}
            layout={drawerContentLayoutTransition}
          >
            <DrawerFeatureArea />
          </Animated.View>
        )
      }
      onEndReached={loadMoreTopics}
      onEndReachedThreshold={0.7}
      recycleItems
      renderItem={renderItem}
    />
  );
});

const DrawerTopicRow = memo(function DrawerTopicRow({
  isActive,
  onPress,
  showActiveBackground,
  topic,
}: DrawerTopicRowProps) {
  const handlePress = useCallback(() => {
    onPress(topic.id);
  }, [onPress, topic.id]);

  return (
    <Pressable
      accessibilityLabel={topic.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className={cn(
        'mx-2 justify-center rounded-lg px-3 active:opacity-70',
        isActive && showActiveBackground && 'bg-surface',
      )}
      onPress={handlePress}
      style={{ height: topicItemHeight }}
    >
      <Text
        className={cn(
          'text-base',
          isActive ? 'font-semibold text-foreground' : 'font-medium text-default-foreground',
        )}
        numberOfLines={1}
      >
        {topic.name}
      </Text>
    </Pressable>
  );
});
