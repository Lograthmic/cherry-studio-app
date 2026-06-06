import type { Message } from '@/data/types/message';

import { mergeMessagesWithOverlay } from '../chatRuntimeMessages';

describe('chat runtime messages', () => {
  test('replaces a persisted placeholder with the streaming overlay', () => {
    const userMessage = createMessage('user-1', 'user');
    const placeholder = createMessage('assistant-1', 'assistant');
    const overlay = {
      ...placeholder,
      data: { parts: [{ type: 'text', text: 'streaming' }] },
    } as Message;

    expect(mergeMessagesWithOverlay([userMessage, placeholder], overlay)).toEqual([
      userMessage,
      overlay,
    ]);
  });

  test('appends the streaming overlay when the placeholder page has not refetched yet', () => {
    const userMessage = createMessage('user-1', 'user');
    const overlay = createMessage('assistant-1', 'assistant');

    expect(mergeMessagesWithOverlay([userMessage], overlay)).toEqual([userMessage, overlay]);
  });
});

function createMessage(id: string, role: Message['role']): Message {
  const now = '2026-05-15T00:00:00.000Z';

  return {
    createdAt: now,
    data: { parts: [] },
    id,
    parentId: role === 'assistant' ? 'user-1' : null,
    role,
    searchableText: '',
    siblingsGroupId: 0,
    status: 'pending',
    topicId: 'topic-1',
    updatedAt: now,
  };
}
