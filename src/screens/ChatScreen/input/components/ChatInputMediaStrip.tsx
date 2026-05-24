import { Image } from 'expo-image';
import { CameraIcon, FileIcon, ImagesIcon, XIcon } from 'lucide-uniwind';
import { type ComponentType, type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { SvgProps } from 'react-native-svg';
import { withUniwind } from 'uniwind';
import type { ChatInputAttachmentDraft } from '@/screens/ChatScreen/input/utils/chatInputAttachments';
import { getChatInputFileExtension } from '@/screens/ChatScreen/input/utils/chatInputAttachments';
import {
  chatInputFadeIn,
  chatInputFadeOut,
  chatInputLayoutTransition,
  chatInputMotionConfig,
} from '@/screens/ChatScreen/input/utils/chatInputMotion';

type ChatInputMediaStripProps = {
  children: ReactNode;
};

type MediaTileProps = {
  accessibilityLabel: string;
  icon: ComponentType<SvgProps>;
  label: string;
  onPress: () => void;
};

type PhotoPreviewTileProps = {
  accessibilityLabel: string;
  isSelected?: boolean;
  onRemove?: () => void;
  onPress: () => void;
  uri: string;
};

type ChatInputPhotoPreviewTileProps = Omit<PhotoPreviewTileProps, 'accessibilityLabel'>;

type ChatInputAttachmentPreviewStripProps = {
  attachments: readonly ChatInputAttachmentDraft[];
  isExiting: boolean;
  onAttachmentRemove: (attachmentId: string) => void;
};

const mediaTileSize = 112;
const StyledAnimatedView = withUniwind(Animated.View);
const StyledPressable = withUniwind(Pressable);

export function ChatInputMediaStrip({ children }: ChatInputMediaStripProps) {
  return (
    <ScrollView
      horizontal
      alwaysBounceHorizontal={false}
      contentContainerStyle={styles.mediaPreviewContent}
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function ChatInputCameraTile({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <MediaTile
      accessibilityLabel={t('chat.media.camera')}
      icon={CameraIcon}
      label={t('chat.media.camera')}
      onPress={onPress}
    />
  );
}

export function ChatInputPhotosTile({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <MediaTile
      accessibilityLabel={t('chat.media.photos')}
      icon={ImagesIcon}
      label={t('chat.media.photos')}
      onPress={onPress}
    />
  );
}

export function ChatInputPhotoPreviewTile({
  isSelected,
  onRemove,
  onPress,
  uri,
}: ChatInputPhotoPreviewTileProps) {
  const { t } = useTranslation();

  return (
    <PhotoPreviewTile
      accessibilityLabel={t('chat.media.photoPreview')}
      isSelected={isSelected}
      onRemove={onRemove}
      uri={uri}
      onPress={onPress}
    />
  );
}

export function ChatInputAttachmentPreviewStrip({
  attachments,
  isExiting,
  onAttachmentRemove,
}: ChatInputAttachmentPreviewStripProps) {
  const containerOpacity = useSharedValue(isExiting ? 0 : 1);

  useEffect(() => {
    containerOpacity.value = withTiming(isExiting ? 0 : 1, chatInputMotionConfig);
  }, [containerOpacity, isExiting]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  if (attachments.length === 0) {
    return null;
  }

  return (
    <StyledAnimatedView className="p-2" style={containerStyle}>
      <ChatInputMediaStrip>
        {attachments.map((attachment) =>
          attachment.kind === 'image' ? (
            <AttachmentImagePreviewTile
              attachment={attachment}
              key={attachment.id}
              onRemove={() => onAttachmentRemove(attachment.id)}
            />
          ) : (
            <AttachmentFilePreviewTile
              attachment={attachment}
              key={attachment.id}
              onRemove={() => onAttachmentRemove(attachment.id)}
            />
          ),
        )}
      </ChatInputMediaStrip>
    </StyledAnimatedView>
  );
}

function MediaTile({ accessibilityLabel, icon: Icon, label, onPress }: MediaTileProps) {
  return (
    <StyledPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="items-center justify-center gap-2 rounded-2xl bg-surface-secondary active:opacity-70"
      onPress={onPress}
      style={styles.mediaTile}
    >
      <Icon className="size-7 text-foreground" strokeWidth={2} />
      <Text className="font-semibold text-base text-foreground">{label}</Text>
    </StyledPressable>
  );
}

function PhotoPreviewTile({
  accessibilityLabel,
  isSelected,
  onRemove,
  onPress,
  uri,
}: PhotoPreviewTileProps) {
  return (
    <StyledPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={[
        'items-center justify-center overflow-hidden rounded-2xl bg-surface-secondary active:opacity-80',
        isSelected ? 'border-[3px]' : '',
      ].join(' ')}
      onPress={onPress}
      style={[styles.mediaTile, isSelected ? styles.photoPreviewTileSelected : null]}
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={uri}
        style={StyleSheet.absoluteFill}
      />
      {isSelected ? (
        <XBadge onPress={onRemove} />
      ) : (
        <View
          className="rounded-full"
          style={[styles.photoSelectionBadge, styles.photoSelectionBadgeUnselected]}
        />
      )}
    </StyledPressable>
  );
}

function AttachmentImagePreviewTile({
  attachment,
  onRemove,
}: {
  attachment: ChatInputAttachmentDraft;
  onRemove: () => void;
}) {
  const { t } = useTranslation();

  return (
    <StyledAnimatedView
      accessibilityLabel={attachment.name || t('chat.attachments.image')}
      className="items-center justify-center overflow-hidden rounded-2xl bg-surface-secondary"
      entering={chatInputFadeIn}
      exiting={chatInputFadeOut}
      layout={chatInputLayoutTransition}
      style={styles.mediaTile}
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={attachment.uri}
        style={StyleSheet.absoluteFill}
      />
      <XBadge onPress={onRemove} />
    </StyledAnimatedView>
  );
}

function AttachmentFilePreviewTile({
  attachment,
  onRemove,
}: {
  attachment: ChatInputAttachmentDraft;
  onRemove: () => void;
}) {
  const extension = getChatInputFileExtension(attachment.name);

  return (
    <StyledAnimatedView
      accessibilityLabel={attachment.name}
      className="items-center justify-center gap-2 overflow-hidden rounded-2xl bg-surface-secondary px-3"
      entering={chatInputFadeIn}
      exiting={chatInputFadeOut}
      layout={chatInputLayoutTransition}
      style={styles.mediaTile}
    >
      <FileIcon className="size-8 text-default-foreground" strokeWidth={2} />
      {extension ? (
        <Text className="font-semibold text-accent text-xs" numberOfLines={1}>
          {extension}
        </Text>
      ) : null}
      <Text className="text-center text-default-foreground text-xs" numberOfLines={2}>
        {attachment.name}
      </Text>
      <XBadge onPress={onRemove} />
    </StyledAnimatedView>
  );
}

function XBadge({ onPress }: { onPress?: () => void }) {
  const { t } = useTranslation();

  if (onPress) {
    return (
      <StyledPressable
        accessibilityLabel={t('common.remove')}
        accessibilityRole="button"
        className="items-center justify-center rounded-full active:opacity-70"
        hitSlop={8}
        onPress={onPress}
        style={[styles.photoSelectionBadge, styles.photoSelectionBadgeSelected]}
      >
        <XIcon className="size-3.5 text-black" strokeWidth={2.5} />
      </StyledPressable>
    );
  }

  return (
    <View
      className="items-center justify-center rounded-full"
      style={[styles.photoSelectionBadge, styles.photoSelectionBadgeSelected]}
    >
      <XIcon className="size-3.5 text-black" strokeWidth={2.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  mediaPreviewContent: {
    gap: 12,
    paddingRight: 4,
  },
  mediaTile: {
    height: mediaTileSize,
    width: mediaTileSize,
  },
  photoPreviewTileSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  photoSelectionBadge: {
    height: 20,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 20,
  },
  photoSelectionBadgeSelected: {
    backgroundColor: '#FFFFFF',
  },
  photoSelectionBadgeUnselected: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
});
