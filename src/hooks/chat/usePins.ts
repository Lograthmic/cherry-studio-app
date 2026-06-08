import { useCallback, useMemo, useRef } from 'react';

import { queryKeys } from '@/data/api';
import { useDataMutation, useDataQuery } from '@/data/hooks';
import type { EntityType } from '@/data/types/entityType';
import type { CreatePinDto, Pin } from '@/data/types/pin';

const EMPTY_PINS: readonly Pin[] = Object.freeze([]);

export function usePins(entityType: EntityType) {
  const listQueryKey = queryKeys.pins.list({ entityType });
  const pinsQuery = useDataQuery({
    queryFn: (services) => services.pin.listByEntityType(entityType),
    queryKey: listQueryKey,
  });
  const createPinMutation = useDataMutation({
    invalidateQueries: [listQueryKey],
    mutationFn: (services, dto: CreatePinDto) => services.pin.pin(dto),
  });
  const deletePinMutation = useDataMutation({
    invalidateQueries: [listQueryKey],
    mutationFn: (services, id: string) => services.pin.unpin(id),
  });
  const toggleInFlightRef = useRef(false);
  const pins = pinsQuery.data ?? EMPTY_PINS;
  const pinnedIds = useMemo(() => pins.map((pin) => pin.entityId), [pins]);
  const isMutating = createPinMutation.isPending || deletePinMutation.isPending;
  const isRefreshing = pinsQuery.isFetching && !pinsQuery.isLoading;
  const error = pinsQuery.error ?? createPinMutation.error ?? deletePinMutation.error;

  const stateRef = useRef({
    isLoading: pinsQuery.isLoading,
    isMutating,
    isRefreshing,
    pins,
  });
  stateRef.current = {
    isLoading: pinsQuery.isLoading,
    isMutating,
    isRefreshing,
    pins,
  };

  const togglePin = useCallback(
    async (entityId: string) => {
      const state = stateRef.current;
      if (state.isLoading || state.isRefreshing || state.isMutating || toggleInFlightRef.current) {
        return;
      }

      toggleInFlightRef.current = true;
      try {
        const existing = state.pins.find((pin) => pin.entityId === entityId);
        if (existing) {
          await deletePinMutation.mutateAsync(existing.id);
          return;
        }

        await createPinMutation.mutateAsync({ entityId, entityType });
      } finally {
        toggleInFlightRef.current = false;
      }
    },
    [createPinMutation, deletePinMutation, entityType],
  );

  return {
    pins,
    pinnedIds,
    isLoading: pinsQuery.isLoading,
    isRefreshing,
    isMutating,
    error,
    refetch: pinsQuery.refetch,
    togglePin,
    pinsQuery,
  };
}
