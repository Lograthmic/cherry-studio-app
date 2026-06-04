import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { MainHeader } from '@/components/headers';
import { useMessages, useTopic } from '@/hooks/chat';

import { NewTopicScreen } from './NewTopicScreen';
import { ChatWorkspace } from './workspace';

export function ChatScreen() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const topic = useTopic(topicId);
  const messageWindow = useMessages(topicId, { enabled: Boolean(topicId) });
  const isTopicAvailable =
    topicId !== undefined && !topic.isError && (topic.isLoading || Boolean(topic.data));
  const topicName = topic.data?.name;

  if (isTopicAvailable) {
    return (
      <>
        <MainHeader topicName={topicName} />
        <View className="flex-1">
          <ChatWorkspace messageWindow={messageWindow} renderGateKey={topicId} />
        </View>
      </>
    );
  }

  return (
    <>
      <MainHeader topicName={topicName} />
      <NewTopicScreen />
    </>
  );
}
