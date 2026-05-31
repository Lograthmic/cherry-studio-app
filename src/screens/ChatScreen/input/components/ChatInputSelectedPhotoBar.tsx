import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ChatInputSelectedPhotoBarProps = {
  selectedPhotoCount: number;
  onPress: () => void;
};

export function ChatInputSelectedPhotoBar({
  selectedPhotoCount,
  onPress,
}: ChatInputSelectedPhotoBarProps) {
  const { t } = useTranslation();

  if (selectedPhotoCount === 0) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.floatingActionContainer}>
      <Pressable
        accessibilityLabel={t('chat.media.addSelectedPhoto', { count: selectedPhotoCount })}
        accessibilityRole="button"
        className="items-center justify-center rounded-full py-3 active:opacity-80"
        onPress={onPress}
        style={styles.floatingActionButton}
      >
        <Text className="font-semibold text-lg" style={styles.floatingActionButtonText}>
          {t('chat.media.addSelectedPhoto', { count: selectedPhotoCount })}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingActionButton: {
    alignSelf: 'center',
    backgroundColor: '#000000',
    width: '85%',
  },
  floatingActionButtonText: {
    color: '#FFFFFF',
  },
  floatingActionContainer: {
    left: 0,
    right: 0,
  },
});
