import { BotIcon } from 'lucide-uniwind/png';
import { ActivityIndicator, View } from 'react-native';

import type { Message } from '@/data/types/message';

import { MessageParts } from '../../messageContent';

type AssistantMessageItemProps = {
  message: Message;
};

export function AssistantMessageItem({ message }: AssistantMessageItemProps) {
  const isPendingEmptyMessage = message.status === 'pending' && !message.data.parts?.length;

  return (
    <View className="w-full flex-row gap-3 px-4 py-3">
      <View className="size-7 items-center justify-center rounded-full border border-border bg-surface-secondary">
        <BotIcon className="size-4 text-default-foreground" strokeWidth={2} />
      </View>
      <View className="min-w-0 flex-1 gap-2 pt-0.5">
        {isPendingEmptyMessage ? (
          <View className="items-start py-1">
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <MessageParts message={message} />
        )}
      </View>
    </View>
  );
}
