import { useCallback, useRef } from 'react';
import {
  getNextModelSelection,
  ModelPickerBottomSheet,
  type ModelPickerBottomSheetHandle,
  type ModelPickerModelItem,
  useModelSettingSelections,
  usePrefetchModelPickerData,
} from '@/components/modelPicker';
import { isUniqueModelId } from '@/data/types/model';
import { useModelById } from '@/hooks/chat';
import { ChatInputActionSheet } from '@/screens/ChatScreen/input/components/ChatInputActionSheet';
import { ChatInputSurface } from '@/screens/ChatScreen/input/components/ChatInputSurface';
import { ChatInputProvider } from '@/screens/ChatScreen/input/context/ChatInputProvider';

export function ChatInput() {
  const modelSettings = useModelSettingSelections();
  usePrefetchModelPickerData();
  const modelPickerRef = useRef<ModelPickerBottomSheetHandle>(null);
  const selectedModelId = isUniqueModelId(modelSettings.selections.default)
    ? modelSettings.selections.default
    : null;
  const { model: selectedModel } = useModelById(selectedModelId);
  const selectedModelLabel = selectedModel?.name;
  const openModelPicker = useCallback(() => {
    modelPickerRef.current?.present();
  }, []);
  const handleModelSelect = useCallback(
    (item: ModelPickerModelItem) => {
      const nextModelId = getNextModelSelection(selectedModelId, item.modelId);

      modelSettings.onSelectionChange('default', nextModelId);
    },
    [modelSettings, selectedModelId],
  );

  return (
    <ChatInputProvider>
      <ChatInputSurface modelLabel={selectedModelLabel} onModelPickerPress={openModelPicker} />
      <ChatInputActionSheet />
      <ModelPickerBottomSheet
        ref={modelPickerRef}
        selectedModelId={selectedModelId}
        onSelect={handleModelSelect}
      />
    </ChatInputProvider>
  );
}
