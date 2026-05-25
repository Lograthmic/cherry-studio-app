import { useDataQuery, usePreference } from '@/data/hooks';
import { queryKeys } from '@/data/api';
import type { Model, UniqueModelId } from '@/data/types/model';

const EMPTY_MODELS: readonly Model[] = Object.freeze([]);

export function useDefaultModel() {
  const [defaultModelId, setDefaultModelId] = usePreference('chat.default_model_id');
  const [quickModelId, setQuickModelId] = usePreference('feature.quick_assistant.model_id');
  const [translateModelId, setTranslateModelId] = usePreference('feature.translate.model_id');

  const { model: defaultModel } = useModelById(defaultModelId as UniqueModelId | null);
  const { model: quickModel } = useModelById(
    (quickModelId ?? defaultModelId) as UniqueModelId | null,
  );
  const { model: translateModel } = useModelById(
    (translateModelId ?? defaultModelId) as UniqueModelId | null,
  );

  return {
    defaultModel,
    quickModel,
    translateModel,
    setDefaultModel: (next: { id: UniqueModelId }) => setDefaultModelId(next.id),
    setQuickModel: (next: { id: UniqueModelId }) => setQuickModelId(next.id),
    setTranslateModel: (next: { id: UniqueModelId }) => setTranslateModelId(next.id),
  };
}

export function useModels(
  query: { capability?: string; enabled?: boolean; providerId?: string } = {},
) {
  const modelsQuery = useDataQuery({
    queryFn: (services) => services.model.list(query),
    queryKey: queryKeys.models.list(query),
  });

  return {
    models: modelsQuery.data ?? EMPTY_MODELS,
    isLoading: modelsQuery.isLoading,
    refetch: modelsQuery.refetch,
    modelsQuery,
  };
}

export function useModelById(uniqueModelId: UniqueModelId | null | undefined) {
  const modelKey = uniqueModelId ?? '';
  const modelQuery = useDataQuery({
    enabled: Boolean(modelKey),
    queryFn: (services) => services.model.getById(modelKey),
    queryKey: queryKeys.models.detail(modelKey),
  });

  return {
    model: modelQuery.data ?? undefined,
    isLoading: modelQuery.isLoading,
    error: modelQuery.error,
    refetch: modelQuery.refetch,
    modelQuery,
  };
}
