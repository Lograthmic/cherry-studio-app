import { queryKeys } from '@/data/api';
import { useDataQuery } from '@/data/hooks';
import type { Provider } from '@/data/types/provider';

const EMPTY_PROVIDERS: readonly Provider[] = Object.freeze([]);

export function useProviders(query: { enabled?: boolean } = {}) {
  const providersQuery = useDataQuery({
    queryFn: (services) => services.provider.list(query),
    queryKey: queryKeys.providers.list(query),
  });

  return {
    providers: providersQuery.data ?? EMPTY_PROVIDERS,
    isLoading: providersQuery.isLoading,
    error: providersQuery.error,
    refetch: providersQuery.refetch,
    providersQuery,
  };
}
