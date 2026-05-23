import type { LegendListRef } from '@legendapp/list/react-native';
import { useRef } from 'react';

import { ChatInitialRenderCover } from '@/components/chat/workspace/ChatInitialRenderCover';
import { ChatMessageList } from '@/components/chat/workspace/ChatMessageList';
import { ChatOlderMessagesIndicator } from '@/components/chat/workspace/ChatOlderMessagesIndicator';
import { ChatWorkspaceFrame } from '@/components/chat/workspace/ChatWorkspaceFrame';
import { FloatingChatInput } from '@/components/chat/workspace/FloatingChatInput';
import { useFloatingChatInputLayout } from '@/components/chat/workspace/hooks/useFloatingChatInputLayout';
import { useMessageListInitialRenderGate } from '@/components/chat/workspace/hooks/useMessageListInitialRenderGate';
import type { MessagesViewModel } from '@/hooks/chat';

type ChatWorkspaceProps = {
  messageWindow: Pick<
    MessagesViewModel,
    'isLoadingInitial' | 'isLoadingOlder' | 'loadOlder' | 'messages' | 'prefetchOlder'
  >;
  renderGateKey: string;
};

export function ChatWorkspace({ messageWindow, renderGateKey }: ChatWorkspaceProps) {
  const { isLoadingInitial, isLoadingOlder, loadOlder, messages } = messageWindow;
  const listRef = useRef<LegendListRef | null>(null);
  const { isCoverVisible, listRenderKey, markListLoaded } = useMessageListInitialRenderGate({
    hasMessages: messages.length > 0,
    isLoadingInitial,
    renderGateKey,
  });
  const { contentBottomInset, handleInputHeightChange } = useFloatingChatInputLayout();

  return (
    <ChatWorkspaceFrame>
      <ChatOlderMessagesIndicator isLoading={isLoadingOlder} />
      <ChatMessageList
        key={listRenderKey}
        contentBottomInset={contentBottomInset}
        listRef={listRef}
        messages={messages}
        onLoad={markListLoaded}
        onLoadOlder={loadOlder}
        onPrefetchOlder={messageWindow.prefetchOlder}
      />
      <FloatingChatInput onHeightChange={handleInputHeightChange} />
      <ChatInitialRenderCover isVisible={isCoverVisible} />
    </ChatWorkspaceFrame>
  );
}

export { ChatInitialRenderCover, ChatMessageList, ChatOlderMessagesIndicator, ChatWorkspaceFrame };
