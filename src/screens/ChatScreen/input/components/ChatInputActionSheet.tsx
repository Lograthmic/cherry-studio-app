import { BottomSheet, BottomSheetView } from '@expo/ui/community/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChatInputActionList } from '@/screens/ChatScreen/input/components/ChatInputActionList';
import { ChatInputActionSheetHeader } from '@/screens/ChatScreen/input/components/ChatInputActionSheetHeader';
import {
  ChatInputCameraTile,
  ChatInputMediaStrip,
  ChatInputPhotoPreviewTile,
  ChatInputPhotosTile,
} from '@/screens/ChatScreen/input/components/ChatInputMediaStrip';
import { ChatInputReasoningSheetPage } from '@/screens/ChatScreen/input/components/ChatInputReasoningSheetPage';
import {
  useChatInputActions,
  useChatInputMedia,
  useChatInputState,
} from '@/screens/ChatScreen/input/context/ChatInputProvider';
import type { ChatInputActionId } from '@/screens/ChatScreen/input/utils/chatInputActions';
import {
  createDocumentAttachmentDraft,
  getPhotoAttachmentId,
} from '@/screens/ChatScreen/input/utils/chatInputAttachments';

const chatInputActionSheetSnapPoints = ['50%', '70%'];
type ChatInputActionSheetPage = 'main' | 'reasoning';

export function ChatInputActionSheet() {
  const {
    addAttachments,
    closeActionSheet,
    removeAttachment,
    selectAction,
    selectReasoningEffort,
  } = useChatInputActions();
  const { attachments, isActionSheetOpen, reasoningEffort, selectedToolId } = useChatInputState();
  const [sheetPage, setSheetPage] = useState<ChatInputActionSheetPage>('main');
  const { actions, state } = useChatInputMedia();
  const {
    launchCamera,
    launchImageLibrary,
    presentLimitedPhotoPermissionsPicker,
    selectPhotoPreview,
  } = actions;
  const { photoAccess, photoPreviews, shouldShowPhotosTile } = state;
  const handleAddFilePress = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
      type: '*/*',
    });

    if (result.canceled) {
      return;
    }

    addAttachments(result.assets.map(createDocumentAttachmentDraft));
    closeActionSheet();
  }, [addAttachments, closeActionSheet]);
  const handleActionPress = useCallback(
    (actionId: ChatInputActionId) => {
      if (actionId === 'add-file') {
        void handleAddFilePress();
        return;
      }

      selectAction(actionId);
      closeActionSheet();
    },
    [closeActionSheet, handleAddFilePress, selectAction],
  );
  const handleReasoningEffortChange = useCallback(
    (nextReasoningEffort: Parameters<typeof selectReasoningEffort>[0]) => {
      selectReasoningEffort(nextReasoningEffort);
      setSheetPage('main');
    },
    [selectReasoningEffort],
  );
  const handleReasoningPress = useCallback(() => {
    setSheetPage('reasoning');
  }, []);
  const handleReasoningBack = useCallback(() => {
    setSheetPage('main');
  }, []);
  const handlePhotosPress = useCallback(() => {
    if (photoAccess === 'limited') {
      void presentLimitedPhotoPermissionsPicker();
      return;
    }

    void launchImageLibrary();
  }, [launchImageLibrary, photoAccess, presentLimitedPhotoPermissionsPicker]);
  const handlePhotoPreviewPress = useCallback(
    (photo: (typeof photoPreviews)[number]) => {
      const attachmentId = getPhotoAttachmentId(photo.id);

      if (attachments.some((attachment) => attachment.id === attachmentId)) {
        return;
      }

      selectPhotoPreview(photo);
    },
    [attachments, selectPhotoPreview],
  );

  const handleClose = useCallback(() => {
    setSheetPage('main');
    closeActionSheet();
  }, [closeActionSheet]);

  return (
    <BottomSheet
      enablePanDownToClose
      enableDynamicSizing={false}
      index={isActionSheetOpen ? 0 : -1}
      snapPoints={chatInputActionSheetSnapPoints}
      onClose={handleClose}
    >
      <BottomSheetView style={styles.sheetViewport}>
        {sheetPage === 'main' ? (
          <View className="gap-4 px-4 pt-2" style={styles.sheetContent}>
            <View className="gap-3">
              <ChatInputActionSheetHeader
                photoAccess={photoAccess}
                onAllPhotosPress={launchImageLibrary}
                onLimitedPhotoAccessPress={presentLimitedPhotoPermissionsPicker}
              />
              <ChatInputMediaStrip>
                <ChatInputCameraTile onPress={launchCamera} />
                {shouldShowPhotosTile ? <ChatInputPhotosTile onPress={handlePhotosPress} /> : null}
                {photoPreviews.map((photo) => (
                  <ChatInputPhotoPreviewTile
                    isSelected={attachments.some(
                      (attachment) => attachment.id === getPhotoAttachmentId(photo.id),
                    )}
                    key={photo.id}
                    onRemove={() => removeAttachment(getPhotoAttachmentId(photo.id))}
                    uri={photo.uri}
                    onPress={() => handlePhotoPreviewPress(photo)}
                  />
                ))}
              </ChatInputMediaStrip>
            </View>
            <View className="h-px bg-border" />
            <ChatInputActionList
              reasoningEffort={reasoningEffort}
              selectedActionId={selectedToolId}
              onActionPress={handleActionPress}
              onReasoningPress={handleReasoningPress}
            />
          </View>
        ) : (
          <ChatInputReasoningSheetPage
            reasoningEffort={reasoningEffort}
            onBack={handleReasoningBack}
            onReasoningEffortChange={handleReasoningEffortChange}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingBottom: 28,
  },
  sheetViewport: {
    flex: 1,
    position: 'relative',
  },
});
