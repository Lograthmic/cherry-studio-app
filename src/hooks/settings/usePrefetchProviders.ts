import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import type { DatabaseRuntime } from '@/data/db/client';
import { queryKeys } from '@/data/queries';
import { useDatabaseRuntime } from '@/data/runtime';

type Services = DatabaseRuntime['services'];

export function prefetchProviders(services: Services, queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryFn: () => services.provider.list(),
    queryKey: queryKeys.providers.list(),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePrefetchProviders() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { services } = useDatabaseRuntime();

  return useCallback(() => {
    router.prefetch('/settings/provider');
    void prefetchProviders(services, queryClient);
  }, [queryClient, router, services]);
}
