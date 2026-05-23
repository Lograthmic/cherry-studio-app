import { ChatInputActionSheet } from '@/components/chat/input/components/ChatInputActionSheet';
import { ChatInputSurface } from '@/components/chat/input/components/ChatInputSurface';
import { ChatInputProvider } from '@/components/chat/input/context/ChatInputProvider';

export function ChatInput() {
  return (
    <ChatInputProvider>
      <ChatInputSurface />
      <ChatInputActionSheet />
    </ChatInputProvider>
  );
}
