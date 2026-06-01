import ExpoQuickLook from '@magrinj/expo-quick-look';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { loggerService } from '@/core/logger/loggerService';
import {
  chatInputControlGap,
  chatInputMergedAddButtonSlotWidth,
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
import {
  chatInputLayoutTransition,
  chatInputMotionConfig,
} from '@/screens/ChatScreen/input/utils/chatInputMotion';

const mergedInputOffset = chatInputMinTextAreaHeight + chatInputControlGap;
const inputSurfaceClassName = 'bg-field ios:shadow-field android:shadow-sm';
const inputSurfaceBackgroundClassName = `absolute inset-0 rounded-3xl ${inputSurfaceClassName}`;

const inputControlSurfaceStyle = {
  minHeight: chatInputMinTextAreaHeight,
};
const logger = loggerService.withContext('ChatInputSurface');

export function ChatInputSurface() {
  const { clearReasoningEffort, clearSelectedTool, removeAttachment } = useChatInputActions();
  const { attachments, isInputFocused, selectedTool, shouldShowReasoningEffortTag } =
    useChatInputState();
  const voiceInput = useChatInputVoiceInput();
  const isVoiceBusy =
    voiceInput.status === 'requesting-permission' || voiceInput.status === 'transcribing';
  const surfaceContentProgress = useSharedValue(0);
  const hasSurfaceContent =
    !voiceInput.isVoiceActive &&
    (isInputFocused ||
      attachments.length > 0 ||
      selectedTool !== undefined ||
      shouldShowReasoningEffortTag);
  const handleAttachmentPreview = useCallback((attachment: ChatInputAttachmentDraft) => {
    void ExpoQuickLook.previewFile({
      editingMode: 'disabled',
      uri: attachment.uri,
    }).catch((error) => {
      logger.warn('Failed to preview attachment', error instanceof Error ? error : null);
    });
  }, []);

  useEffect(() => {
    surfaceContentProgress.value = withTiming(hasSurfaceContent ? 1 : 0, chatInputMotionConfig);
  }, [hasSurfaceContent, surfaceContentProgress]);

  const controlGroupStyle = useAnimatedStyle(() => ({
    marginLeft: ((1 - surfaceContentProgress.value) * mergedInputOffset) / 2,
    marginRight: ((1 - surfaceContentProgress.value) * mergedInputOffset) / 2,
  }));

  const controlGapStyle = useAnimatedStyle(() => ({
    width: surfaceContentProgress.value * chatInputControlGap,
  }));

  const mergedSurfaceStyle = useAnimatedStyle(() => ({
    opacity: 1 - surfaceContentProgress.value,
  }));

  const separatedSurfaceStyle = useAnimatedStyle(() => ({
    opacity: surfaceContentProgress.value,
  }));

  const addButtonSlotStyle = useAnimatedStyle(() => ({
    alignSelf: 'flex-end',
    width:
      chatInputMergedAddButtonSlotWidth +
      surfaceContentProgress.value *
        (chatInputMinTextAreaHeight - chatInputMergedAddButtonSlotWidth),
  }));

  return (
    <>
      <View className="flex-row items-end">
        <Animated.View
          className="flex-1 flex-row items-end"
          layout={chatInputLayoutTransition}
          style={[inputControlSurfaceStyle, controlGroupStyle]}
        >
          <Animated.View
            className={inputSurfaceBackgroundClassName}
            pointerEvents="none"
            style={mergedSurfaceStyle}
          />
          {voiceInput.isVoiceActive ? (
            <ChatInputVoiceRecordingSurface
              isBusy={isVoiceBusy}
              volumeSamples={voiceInput.volumeSamples}
              onSendPress={voiceInput.stopAndCommit}
              onStopPress={voiceInput.stopAndCommit}
            />
          ) : (
            <>
              <Animated.View style={addButtonSlotStyle}>
                <ChatInputAddButton separatedSurfaceStyle={separatedSurfaceStyle} />
              </Animated.View>
              <Animated.View style={controlGapStyle} />
              <Animated.View
                className="flex-1"
                layout={chatInputLayoutTransition}
                style={inputControlSurfaceStyle}
              >
                <Animated.View
                  className={inputSurfaceBackgroundClassName}
                  pointerEvents="none"
                  style={separatedSurfaceStyle}
                />
                <Animated.View
                  className="relative overflow-hidden rounded-3xl"
                  layout={chatInputLayoutTransition}
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
                  <ChatInputPrimaryActionButton
                    isVoiceBusy={isVoiceBusy}
                    onVoiceInputPress={voiceInput.start}
                  />
                </Animated.View>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </View>
      <ChatInputVoiceErrorDialog error={voiceInput.error} onDismiss={voiceInput.clearError} />
    </>
  );
}
