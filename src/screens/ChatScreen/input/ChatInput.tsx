import { useCallback, useState } from 'react';
import {
  getNextModelSelection,
  ModelPickerBottomSheet,
  type ModelPickerModelItem,
  useModelSettingSelections,
} from '@/components/modelPicker';
import { isUniqueModelId } from '@/data/types/model';
import { useModelById } from '@/hooks/chat';
import { ChatInputActionSheet } from '@/screens/ChatScreen/input/components/ChatInputActionSheet';
import { ChatInputSurface } from '@/screens/ChatScreen/input/components/ChatInputSurface';
import { ChatInputProvider } from '@/screens/ChatScreen/input/context/ChatInputProvider';

export function ChatInput() {
  const modelSettings = useModelSettingSelections();
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const selectedModelId = isUniqueModelId(modelSettings.selections.default)
    ? modelSettings.selections.default
    : null;
  const { model: selectedModel } = useModelById(selectedModelId);
  const selectedModelLabel = selectedModel?.name;
  const openModelPicker = useCallback(() => {
    setIsModelPickerOpen(true);
  }, []);
  const closeModelPicker = useCallback(() => {
    setIsModelPickerOpen(false);
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
        isOpen={isModelPickerOpen}
        selectedModelId={selectedModelId}
        onClose={closeModelPicker}
        onSelect={handleModelSelect}
      />
    </ChatInputProvider>
  );
}
