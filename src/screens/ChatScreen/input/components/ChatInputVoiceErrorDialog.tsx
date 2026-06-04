import { Button } from 'heroui-native/button';
import { Dialog } from 'heroui-native/dialog';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { VoiceInputError } from '@/services/chat/voice';

type ChatInputVoiceErrorDialogProps = {
  error: VoiceInputError | null;
  onDismiss: () => void;
};

function getVoiceInputErrorMessageKey(error: VoiceInputError) {
  switch (error.code) {
    case 'busy':
      return 'chat.voice.error.busy';
    case 'cancelled':
      return 'chat.voice.error.cancelled';
    case 'missing-language':
      return 'chat.voice.error.missingLanguage';
    case 'no-speech':
      return 'chat.voice.error.noSpeech';
    case 'not-allowed':
      return 'chat.voice.error.notAllowed';
    case 'not-available':
      return 'chat.voice.error.notAvailable';
    case 'unknown':
      return 'chat.voice.error.unknown';
  }
}

export function ChatInputVoiceErrorDialog({ error, onDismiss }: ChatInputVoiceErrorDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog isOpen={Boolean(error)} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <Dialog.Portal unstable_accessibilityContainerViewIsModal>
        <Dialog.Overlay />
        <Dialog.Content className="gap-5 rounded-3xl bg-overlay p-5" isSwipeable={false}>
          <View className="gap-1.5">
            <Dialog.Title>{t('chat.voice.error.title')}</Dialog.Title>
            <Dialog.Description>
              {error ? t(getVoiceInputErrorMessageKey(error)) : ''}
            </Dialog.Description>
          </View>
          <View className="flex-row justify-end">
            <Button className="min-w-20 rounded-xl" size="sm" variant="primary" onPress={onDismiss}>
              <Text className="text-sm text-white">{t('common.close')}</Text>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
