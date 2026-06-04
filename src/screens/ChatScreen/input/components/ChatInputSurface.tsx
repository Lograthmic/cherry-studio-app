import ExpoQuickLook from '@magrinj/expo-quick-look';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { loggerService } from '@/core/logger/loggerService';
import {
  chatInputBottomToolbarHeight,
  chatInputMinComposerHeight,
  chatInputMinTextAreaHeight,
} from '@/screens/ChatScreen/input/chatInputLayout';
import { ChatInputAddButton } from '@/screens/ChatScreen/input/components/ChatInputAddButton';
import { ChatInputAttachmentPreviewStrip } from '@/screens/ChatScreen/input/components/ChatInputMediaStrip';
import { ChatInputPrimaryActionButton } from '@/screens/ChatScreen/input/components/ChatInputPrimaryActionButton';
import { ChatInputTextArea } from '@/screens/ChatScreen/input/components/ChatInputTextArea';
import { ChatInputToolbar } from '@/screens/ChatScreen/input/components/ChatInputToolbar';
import { ChatInputVoiceErrorDialog } from '@/screens/ChatScreen/input/components/ChatInputVoiceErrorDialog';
import { ChatInputVoiceRecordingSurface } from '@/screens/ChatScreen/input/components/ChatInputVoiceRecordingSurface';
import {
  useChatInputActions,
  useChatInputState,
} from '@/screens/ChatScreen/input/context/ChatInputProvider';
import { useChatInputVoiceInput } from '@/screens/ChatScreen/input/hooks/useChatInputVoiceInput';
import type { ChatInputAttachmentDraft } from '@/screens/ChatScreen/input/utils/chatInputAttachments';
import { chatInputLayoutTransition } from '@/screens/ChatScreen/input/utils/chatInputMotion';

const inputControlSurfaceStyle = {
  minHeight: chatInputMinComposerHeight,
};

const inputBottomToolbarStyle = {
  minHeight: chatInputBottomToolbarHeight,
};

const logger = loggerService.withContext('ChatInputSurface');

type ChatInputSurfaceProps = {
  modelLabel?: string;
  onModelPickerPress: () => void;
};

export function ChatInputSurface({ modelLabel, onModelPickerPress }: ChatInputSurfaceProps) {
  const { clearReasoningEffort, clearSelectedTool, removeAttachment } = useChatInputActions();
  const { attachments, selectedTool, shouldShowReasoningEffortTag } = useChatInputState();
  const voiceInput = useChatInputVoiceInput();
  const isVoiceBusy =
    voiceInput.status === 'requesting-permission' || voiceInput.status === 'transcribing';
  const handleAttachmentPreview = useCallback((attachment: ChatInputAttachmentDraft) => {
    void ExpoQuickLook.previewFile({
      editingMode: 'disabled',
      uri: attachment.uri,
    }).catch((error) => {
      logger.warn('Failed to preview attachment', error instanceof Error ? error : null);
    });
  }, []);

  return (
    <>
      <View className="flex-row items-end">
        <Animated.View
          className="flex-1"
          layout={chatInputLayoutTransition}
          style={voiceInput.isVoiceActive ? { minHeight: chatInputMinTextAreaHeight } : undefined}
        >
          {voiceInput.isVoiceActive ? (
            <ChatInputVoiceRecordingSurface
              isBusy={isVoiceBusy}
              volumeSamples={voiceInput.volumeSamples}
              onSendPress={voiceInput.stopAndCommit}
              onStopPress={voiceInput.stopAndCommit}
            />
          ) : (
            <Animated.View
              className="relative overflow-hidden rounded-3xl bg-field ios:shadow-field android:shadow-sm"
              layout={chatInputLayoutTransition}
              style={inputControlSurfaceStyle}
            >
              <ChatInputToolbar
                shouldShowReasoningEffortTag={shouldShowReasoningEffortTag}
                selectedTool={selectedTool}
                onReasoningEffortClear={clearReasoningEffort}
                onToolClear={clearSelectedTool}
              />
              <ChatInputAttachmentPreviewStrip
                attachments={attachments}
                onAttachmentPreview={handleAttachmentPreview}
                onAttachmentRemove={removeAttachment}
              />
              <ChatInputTextArea />
              <View
                className="flex-row items-center gap-2 px-3 pb-1.5 pr-11"
                style={inputBottomToolbarStyle}
              >
                <ChatInputAddButton />
                <ModelPickerPill label={modelLabel} onPress={onModelPickerPress} />
              </View>
              <ChatInputPrimaryActionButton
                isVoiceBusy={isVoiceBusy}
                onVoiceInputPress={voiceInput.start}
              />
            </Animated.View>
          )}
        </Animated.View>
      </View>
      <ChatInputVoiceErrorDialog error={voiceInput.error} onDismiss={voiceInput.clearError} />
    </>
  );
}

function ModelPickerPill({ label, onPress }: { label?: string; onPress: () => void }) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('chat.model.select');

  return (
    <Pressable
      accessibilityLabel={resolvedLabel}
      accessibilityRole="button"
      className="h-8 max-w-[68%] justify-center rounded-full bg-surface-secondary px-3 active:bg-surface-tertiary active:opacity-70"
      onPress={onPress}
    >
      <Text className="font-semibold text-foreground text-sm" numberOfLines={1}>
        {resolvedLabel}
      </Text>
    </Pressable>
  );
}
