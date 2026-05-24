export const queryKeys = {
  assistants: {
    detail: (assistantId: string) => [`/assistants/${assistantId}`] as const,
    list: (
      params: {
        id?: string;
        limit?: number;
        page?: number;
        search?: string;
        tagIds?: string[];
      } = {},
    ) => ['/assistants', params] as const,
  },
  topics: {
    list: (params: { cursor?: string; limit?: number; q?: string } = {}) =>
      ['/topics', params] as const,
    detail: (topicId: string) => [`/topics/${topicId}`] as const,
  },
  messages: {
    topic: (topicId: string, pageSize: { initial: number; older: number }) =>
      [`/topics/${topicId}/messages`, { pageSize }] as const,
  },
  models: {
    list: (params: { enabled?: boolean; providerId?: string } = {}) => ['/models', params] as const,
  },
  providers: {
    apiKeys: (providerId: string, params: { enabled?: boolean } = {}) =>
      [`/providers/${providerId}/api-keys`, params] as const,
    authConfig: (providerId: string) => [`/providers/${providerId}/auth-config`] as const,
    detail: (providerId: string) => [`/providers/${providerId}`] as const,
    list: (params: { enabled?: boolean } = {}) => ['/providers', params] as const,
  },
  preferences: {
    all: ['preferences'] as const,
    key: (key: string) => ['preferences', key] as const,
  },
  tags: {
    detail: (tagId: string) => [`/tags/${tagId}`] as const,
    list: () => ['/tags'] as const,
  },
};
