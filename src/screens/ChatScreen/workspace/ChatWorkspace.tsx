import type { LegendListRef } from '@legendapp/list/react-native';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useRef } from 'react';

import { isIOS } from '@/config/constants';
import type { MessagesViewModel } from '@/hooks/chat';

import { mergeMessagesWithOverlay, useChatRuntimeTopic } from '../runtime';
import { ChatInitialRenderCover } from './components/ChatInitialRenderCover';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatOlderMessagesIndicator } from './components/ChatOlderMessagesIndicator';
import { ChatWorkspaceFrame } from './components/ChatWorkspaceFrame';
import { FloatingChatInput } from './components/FloatingChatInput';
import { useFloatingChatInputLayout } from './hooks/useFloatingChatInputLayout';
import { useMessageListInitialRenderGate } from './hooks/useMessageListInitialRenderGate';

type ChatWorkspaceProps = {
  messageWindow: Pick<
    MessagesViewModel,
    'isLoadingInitial' | 'isLoadingOlder' | 'loadOlder' | 'messages' | 'prefetchOlder'
  >;
  renderGateKey: string;
  topicId: string;
};

export function ChatWorkspace({ messageWindow, renderGateKey, topicId }: ChatWorkspaceProps) {
  const { isLoadingInitial, isLoadingOlder, loadOlder, messages } = messageWindow;
  const chatRuntime = useChatRuntimeTopic(topicId);
  const headerHeight = useHeaderHeight();
  const listRef = useRef<LegendListRef | null>(null);
  const messagesWithUser = mergeMessagesWithOverlay(messages, chatRuntime.pendingUserMessage);
  const visibleMessages = mergeMessagesWithOverlay(messagesWithUser, chatRuntime.overlayMessage);
  const { isCoverVisible, listRenderKey, markListLoaded } = useMessageListInitialRenderGate({
    hasMessages: visibleMessages.length > 0,
    isLoadingInitial,
    renderGateKey,
  });
  const contentTopInset = isIOS ? headerHeight : 0;
  const { contentBottomInset, handleInputHeightChange } = useFloatingChatInputLayout();

  return (
    <ChatWorkspaceFrame>
      <ChatOlderMessagesIndicator isLoading={isLoadingOlder} />
      <ChatMessageList
        key={listRenderKey}
        contentBottomInset={contentBottomInset}
        contentTopInset={contentTopInset}
        listRef={listRef}
        messages={visibleMessages}
        onLoadOlder={loadOlder}
        onPrefetchOlder={messageWindow.prefetchOlder}
        onReady={markListLoaded}
      />
      <FloatingChatInput topicId={topicId} onHeightChange={handleInputHeightChange} />
      <ChatInitialRenderCover bottomInset={contentBottomInset} isVisible={isCoverVisible} />
    </ChatWorkspaceFrame>
  );
}
