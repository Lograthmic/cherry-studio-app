import { BottomSheet, BottomSheetView } from '@expo/ui/community/bottom-sheet';
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
import { ChatInputSelectedPhotoBar } from '@/screens/ChatScreen/input/components/ChatInputSelectedPhotoBar';
import {
  useChatInputActions,
  useChatInputMedia,
  useChatInputState,
} from '@/screens/ChatScreen/input/context/ChatInputProvider';
import type { ChatInputActionId } from '@/screens/ChatScreen/input/utils/chatInputActions';

const chatInputActionSheetSnapPoints = ['50%', '70%'];
type ChatInputActionSheetPage = 'main' | 'reasoning';

export function ChatInputActionSheet() {
  const { closeActionSheet, selectAction, selectReasoningEffort } = useChatInputActions();
  const { isActionSheetOpen, reasoningEffort, selectedToolId } = useChatInputState();
  const [sheetPage, setSheetPage] = useState<ChatInputActionSheetPage>('main');
  const { actions, state } = useChatInputMedia();
  const {
    clearSelectedPhotos,
    launchCamera,
    launchImageLibrary,
    presentLimitedPhotoPermissionsPicker,
    togglePhotoSelection,
  } = actions;
  const {
    photoAccess,
    photoPreviews,
    selectedPhotoCount,
    selectedPhotoOrder,
    shouldShowPhotosTile,
  } = state;
  const handleActionPress = useCallback(
    (actionId: ChatInputActionId) => {
      clearSelectedPhotos();
      selectAction(actionId);
      closeActionSheet();
    },
    [clearSelectedPhotos, closeActionSheet, selectAction],
  );
  const handleReasoningEffortChange = useCallback(
    (nextReasoningEffort: Parameters<typeof selectReasoningEffort>[0]) => {
      selectReasoningEffort(nextReasoningEffort);
      setSheetPage('main');
    },
    [selectReasoningEffort],
  );
  const handleReasoningPress = useCallback(() => {
    clearSelectedPhotos();
    setSheetPage('reasoning');
  }, [clearSelectedPhotos]);
  const handleReasoningBack = useCallback(() => {
    setSheetPage('main');
  }, []);
  const handleSelectedPhotosAdd = useCallback(() => undefined, []);
  const handlePhotosPress = useCallback(() => {
    if (photoAccess === 'limited') {
      void presentLimitedPhotoPermissionsPicker();
      return;
    }

    void launchImageLibrary();
  }, [launchImageLibrary, photoAccess, presentLimitedPhotoPermissionsPicker]);

  const handleClose = useCallback(() => {
    clearSelectedPhotos();
    setSheetPage('main');
    closeActionSheet();
  }, [clearSelectedPhotos, closeActionSheet]);

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
                    key={photo.id}
                    selectionOrder={selectedPhotoOrder.get(photo.id)}
                    uri={photo.uri}
                    onPress={() => togglePhotoSelection(photo.id)}
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
        {sheetPage === 'main' ? (
          <ChatInputSelectedPhotoBar
            selectedPhotoCount={selectedPhotoCount}
            onPress={handleSelectedPhotosAdd}
          />
        ) : null}
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
