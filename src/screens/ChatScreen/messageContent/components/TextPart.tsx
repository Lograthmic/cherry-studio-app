import { Text } from 'heroui-native/text';
import type { CherryMessagePart } from '@/data/types/message';
import type { MessagePartRenderMode } from './MessageParts';
import { PartMarkdown } from './PartMarkdown';

type TextPartProps = {
  part: Extract<CherryMessagePart, { type: 'text' }>;
  renderMode?: MessagePartRenderMode;
};

export function TextPart({ part, renderMode = 'markdown' }: TextPartProps) {
  if (renderMode === 'plainText') {
    return (
      <Text className="leading-6" selectable type="body">
        {part.text}
      </Text>
    );
  }

  return <PartMarkdown markdown={part.text} />;
}
