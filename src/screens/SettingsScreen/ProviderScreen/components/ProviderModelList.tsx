import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, View } from 'react-native';

import type { Model } from '@/data/types/model';
import type { Provider } from '@/data/types/provider';
import {
  ProviderModelAccordion,
  ProviderModelSearchField,
  ProviderModelToolbar,
  useProviderModelGroups,
} from '../models';

type ProviderModelListProps = {
  header?: ReactElement;
  isCheckDisabled?: boolean;
  isCheckLoading?: boolean;
  isLoading: boolean;
  isPullDisabled?: boolean;
  isPullLoading?: boolean;
  models: Model[];
  onCheckPress?: () => void;
  onPullPress?: () => void;
  provider: Provider | undefined;
};

export function ProviderModelList({
  header,
  isCheckDisabled = false,
  isCheckLoading = false,
  isLoading,
  isPullDisabled = false,
  isPullLoading = false,
  models,
  onCheckPress,
  onPullPress,
  provider,
}: ProviderModelListProps) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const { displayedExpandedValues, groups, isSearching, setExpandedValues } =
    useProviderModelGroups({ models, searchText });

  const emptyTitle = isLoading
    ? t('settings.provider.models.loading')
    : isSearching
      ? t('settings.provider.models.search.empty')
      : t('settings.provider.models.empty');

  return (
    <ProviderModelAccordion
      displayedExpandedValues={displayedExpandedValues}
      emptyTitle={emptyTitle}
      groups={groups}
      ListHeaderComponent={
        <View className="gap-6 px-4 py-5">
          {header}
          <View className="gap-3">
            <ProviderModelToolbar
              isCheckDisabled={isCheckDisabled}
              isCheckLoading={isCheckLoading}
              isPullDisabled={isPullDisabled}
              isPullLoading={isPullLoading}
              onCheckPress={onCheckPress}
              onPullPress={onPullPress}
            />
            <ProviderModelSearchField searchText={searchText} setSearchText={setSearchText} />
          </View>
        </View>
      }
      provider={provider}
      onExpandedValuesChange={setExpandedValues}
      onScrollBeginDrag={Keyboard.dismiss}
    />
  );
}
