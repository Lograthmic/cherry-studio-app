import {
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { DatabaseRuntime } from '@/data/db/client';
import { useDatabaseRuntime } from '@/data/runtime';

type Services = DatabaseRuntime['services'];

type DataMutationFunction<TData, TVariables> = (
  services: Services,
  variables: TVariables,
) => Promise<TData>;

type DataMutationOptions<TData, TError, TVariables, TContext> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationFn'
> & {
  invalidateQueries?: QueryKey[];
  mutationFn: DataMutationFunction<TData, TVariables>;
};

export function useDataMutation<TData, TError = Error, TVariables = void, TContext = unknown>(
  options: DataMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { services } = useDatabaseRuntime();
  const queryClient = useQueryClient();
  const { invalidateQueries, mutationFn, onSuccess, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    mutationFn: (variables) => mutationFn(services, variables),
    onSuccess: async (data, variables, onMutateResult, context) => {
      for (const queryKey of invalidateQueries ?? []) {
        await queryClient.invalidateQueries({ queryKey });
      }

      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
