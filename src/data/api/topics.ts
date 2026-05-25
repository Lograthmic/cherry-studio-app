export const topicQueryKeys = {
  list: (params: { cursor?: string; limit?: number; q?: string } = {}) =>
    ['/topics', params] as const,
  detail: (topicId: string) => [`/topics/${topicId}`] as const,
};
