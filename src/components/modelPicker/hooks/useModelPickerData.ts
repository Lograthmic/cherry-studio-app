import { useCallback, useMemo } from 'react';

import { useModels, usePins, useProviders } from '@/hooks/chat';
import {
  buildModelPickerGroups,
  getAvailableModelPickerFilterTags,
  getModelPickerModelItem,
  getPinnedModelIds,
  type ModelPickerModelItem,
  type ModelPickerTag,
} from '../utils/modelPickerData';

type UseModelPickerDataOptions = {
  searchText?: string;
  selectedTags?: readonly ModelPickerTag[];
  showPinnedModels?: boolean;
};

export function useModelPickerData({
  searchText = '',
  selectedTags = [],
  showPinnedModels = true,
}: UseModelPickerDataOptions = {}) {
  const { isLoading: isModelsLoading, models, modelsQuery } = useModels({ enabled: true });
  const {
    isLoading: isProvidersLoading,
    providers,
    providersQuery,
  } = useProviders({
    enabled: true,
  });
  const pins = usePins('model');
  const pinnedModelIds = useMemo(() => getPinnedModelIds(pins.pins), [pins.pins]);
  const groups = useMemo(
    () =>
      buildModelPickerGroups({
        models,
        pinnedModelIds,
        providers,
        searchText,
        selectedTags,
        showPinnedModels,
      }),
    [models, pinnedModelIds, providers, searchText, selectedTags, showPinnedModels],
  );
  const availableTags = useMemo(
    () => getAvailableModelPickerFilterTags({ models, providers }),
    [models, providers],
  );
  const modelItems = useMemo<ModelPickerModelItem[]>(
    () => groups.flatMap((group) => group.items),
    [groups],
  );
  const getModelItem = useCallback(
    (modelId: string | null) =>
      getModelPickerModelItem(modelId, {
        models,
        pinnedModelIds,
        providers,
      }),
    [models, pinnedModelIds, providers],
  );

  return {
    availableTags,
    groups,
    isLoading: isModelsLoading || isProvidersLoading || pins.isLoading,
    isPinActionDisabled: pins.isLoading || pins.isRefreshing || pins.isMutating,
    modelItems,
    models,
    pinnedModelIds,
    pins,
    providers,
    queries: {
      models: modelsQuery,
      pins: pins.pinsQuery,
      providers: providersQuery,
    },
    getModelItem,
    togglePin: pins.togglePin,
  };
}
