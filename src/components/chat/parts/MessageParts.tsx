import { MessagePart } from '@/components/chat/parts/MessagePart';
import type { Message } from '@/data/types/message';

type MessagePartsProps = {
  message: Message;
};

function getMessagePartKey(
  message: Message,
  part: NonNullable<Message['data']['parts']>[number],
  index: number,
) {
  return `${message.id}-${part.type}-${index}`;
}

export function MessageParts({ message }: MessagePartsProps) {
  const parts = message.data.parts;

  if (!parts?.length) {
    return null;
  }

  return parts.map((part, index) => (
    <MessagePart key={getMessagePartKey(message, part, index)} part={part} />
  ));
}
