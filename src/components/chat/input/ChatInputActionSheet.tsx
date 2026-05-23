import { BottomSheet, BottomSheetView } from '@expo/ui/community/bottom-sheet';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type ChatInputActionId,
  ChatInputActionList,
} from '@/components/chat/input/ChatInputActionList';
import { ChatInputActionSheetHeader } from '@/components/chat/input/ChatInputActionSheetHeader';
import {
  ChatInputCameraTile,
  ChatInputMediaStrip,
  ChatInputPhotoPreviewTile,
  ChatInputPhotosTile,
} from '@/components/chat/input/ChatInputMediaStrip';
import { ChatInputSelectedPhotoBar } from '@/components/chat/input/ChatInputSelectedPhotoBar';
import { useChatInputPhotoPicker } from '@/components/chat/input/hooks/useChatInputPhotoPicker';

type ChatInputActionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

const chatInputActionSheetSnapPoints = ['50%', '70%'];

export function ChatInputActionSheet({ isOpen, onClose }: ChatInputActionSheetProps) {
  const { actions, state } = useChatInputPhotoPicker(isOpen);
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
  const handleActionPress = useCallback((_actionId: ChatInputActionId) => undefined, []);
  const handleSelectedPhotosAdd = useCallback(() => undefined, []);

  const handleClose = useCallback(() => {
    clearSelectedPhotos();
    onClose();
  }, [clearSelectedPhotos, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <BottomSheet
      enablePanDownToClose
      enableDynamicSizing={false}
      snapPoints={chatInputActionSheetSnapPoints}
      onClose={handleClose}
    >
      <BottomSheetView style={styles.sheetViewport}>
        <View className="gap-4 px-4 pt-2" style={styles.sheetContent}>
          <View className="gap-3">
            <ChatInputActionSheetHeader
              photoAccess={photoAccess}
              onAllPhotosPress={launchImageLibrary}
              onLimitedPhotoAccessPress={presentLimitedPhotoPermissionsPicker}
            />
            <ChatInputMediaStrip>
              <ChatInputCameraTile onPress={launchCamera} />
              {shouldShowPhotosTile ? <ChatInputPhotosTile onPress={launchImageLibrary} /> : null}
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
          <ChatInputActionList onActionPress={handleActionPress} />
        </View>
        <ChatInputSelectedPhotoBar
          selectedPhotoCount={selectedPhotoCount}
          onPress={handleSelectedPhotosAdd}
        />
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
