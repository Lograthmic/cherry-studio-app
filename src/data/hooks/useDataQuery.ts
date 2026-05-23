import {
  type InfiniteData,
  type QueryFunctionContext,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseQueryOptions,
  type UseQueryResult,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import type { DatabaseRuntime } from '@/data/db/client';
import { useDatabaseRuntime } from '@/data/runtime';

type Services = DatabaseRuntime['services'];

type DataQueryFunction<TData, TQueryKey extends QueryKey> = (
  services: Services,
  context: QueryFunctionContext<TQueryKey>,
) => Promise<TData>;

type DataInfiniteQueryFunction<TData, TQueryKey extends QueryKey, TPageParam> = (
  services: Services,
  context: QueryFunctionContext<TQueryKey, TPageParam>,
) => Promise<TData>;

type DataQueryOptions<TData, TError, TSelected, TQueryKey extends QueryKey> = Omit<
  UseQueryOptions<TData, TError, TSelected, TQueryKey>,
  'queryFn'
> & {
  queryFn: DataQueryFunction<TData, TQueryKey>;
};

type DataInfiniteQueryOptions<
  TData,
  TError,
  TSelected,
  TQueryKey extends QueryKey,
  TPageParam,
> = Omit<UseInfiniteQueryOptions<TData, TError, TSelected, TQueryKey, TPageParam>, 'queryFn'> & {
  queryFn: DataInfiniteQueryFunction<TData, TQueryKey, TPageParam>;
};

export function useDataQuery<
  TData,
  TError = Error,
  TSelected = TData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DataQueryOptions<TData, TError, TSelected, TQueryKey>,
): UseQueryResult<TSelected, TError> {
  const { services } = useDatabaseRuntime();
  const { queryFn, ...queryOptions } = options;

  return useQuery({
    ...queryOptions,
    queryFn: (context) => queryFn(services, context),
  });
}

export function useDataInfiniteQuery<
  TData,
  TError = Error,
  TSelected = InfiniteData<TData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: DataInfiniteQueryOptions<TData, TError, TSelected, TQueryKey, TPageParam>,
): UseInfiniteQueryResult<TSelected, TError> {
  const { services } = useDatabaseRuntime();
  const { queryFn, ...queryOptions } = options;

  return useInfiniteQuery({
    ...queryOptions,
    queryFn: (context) => queryFn(services, context),
  });
}
