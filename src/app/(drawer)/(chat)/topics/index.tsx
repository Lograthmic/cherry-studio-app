import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ChatWorkspace } from '@/components/chat/workspace/ChatWorkspace';
import { MainHeader } from '@/components/headers';
import { NewTopicWorkspace } from '@/components/topic/NewTopicWorkspace';
import { useMessages, useTopic } from '@/hooks/chat';

export default function ChatScreen() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const topic = useTopic(topicId);
  const messageWindow = useMessages(topicId, { enabled: Boolean(topicId) });
  const isTopicAvailable =
    topicId !== undefined && !topic.isError && (topic.isLoading || Boolean(topic.data));

  if (isTopicAvailable) {
    return (
      <>
        <MainHeader />
        <View className="flex-1 bg-background">
          <ChatWorkspace messageWindow={messageWindow} renderGateKey={topicId} />
        </View>
      </>
    );
  }

  return (
    <>
      <MainHeader />
      <NewTopicWorkspace />
    </>
  );
}
