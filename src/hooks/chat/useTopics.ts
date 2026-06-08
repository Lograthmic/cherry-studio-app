import { type InfiniteData } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { queryKeys } from '@/data/api';
import { useDataInfiniteQuery, useDataQuery } from '@/data/hooks/useDataQuery';
import type { CursorPaginationResponse } from '@/data/types/apiTypes';
import type { Topic } from '@/data/types/topic';
import { useHydrateTopicDetails } from './useHydrateTopicDetails';

type TopicsQueryKey = ReturnType<typeof queryKeys.topics.list>;
type TopicDetailQueryKey = ReturnType<typeof queryKeys.topics.detail>;

export type TopicsOptions = {
  q: string;
};

export type TopicsViewModel = {
  isLoadingInitial: boolean;
  loadMore: () => Promise<void>;
  topics: readonly Topic[];
};

const defaultPageSize = 50;

export function useTopics(options: TopicsOptions): TopicsViewModel {
  const queryText = options.q.trim() || undefined;

  const query = useDataInfiniteQuery<
    CursorPaginationResponse<Topic>,
    Error,
    InfiniteData<CursorPaginationResponse<Topic>, string | undefined>,
    TopicsQueryKey,
    string | undefined
  >({
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    queryFn: (services, { pageParam }) =>
      services.topic.listByCursor({
        cursor: pageParam,
        limit: defaultPageSize,
        q: queryText,
      }),
    queryKey: queryKeys.topics.list({ limit: defaultPageSize, q: queryText }),
  });

  const topics = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.items),
    [query.data?.pages],
  );

  useHydrateTopicDetails(topics);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    isLoadingInitial: query.isLoading,
    loadMore,
    topics,
  };
}

export function useTopic(topicId: string | undefined) {
  const enabled = Boolean(topicId);
  const queryTopicId = topicId ?? '__missing_topic__';

  return useDataQuery<Topic, Error, Topic, TopicDetailQueryKey>({
    enabled,
    queryFn: (services) => services.topic.getById(topicId ?? ''),
    queryKey: queryKeys.topics.detail(queryTopicId),
  });
}
