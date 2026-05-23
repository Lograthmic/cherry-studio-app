export const messageWindowPolicy = {
  drawerPrefetchTopicCount: 12,
  initialFetchCount: 12,
  initialRenderCount: 4,
  olderFetchCount: 12,
  olderPrefetchStartThreshold: 0.85,
  prefetchStaleTimeMs: 30_000,
  revealCount: 4,
} as const;
