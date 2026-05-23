import { BottomSheet, BottomSheetView } from '@expo/ui/community/bottom-sheet';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import {
  CameraIcon,
  GlobeIcon,
  ImageIcon,
  ImagesIcon,
  InfoIcon,
  LightbulbIcon,
  PaperclipIcon,
} from 'lucide-uniwind';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { useUniwind, withUniwind } from 'uniwind';

type ChatInputActionSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ChatInputAction = {
  icon: React.ComponentType<SvgProps>;
  id: string;
  titleKey: string;
};

type PhotoAccess = 'all' | 'limited' | 'none';

type PhotoPreview = {
  id: string;
  uri: string;
};

const chatInputActions = [
  {
    icon: ImageIcon,
    id: 'create-image',
    titleKey: 'chat.actions.createImage',
  },
  {
    icon: LightbulbIcon,
    id: 'think',
    titleKey: 'chat.actions.think',
  },
  {
    icon: GlobeIcon,
    id: 'web-search',
    titleKey: 'chat.actions.webSearch',
  },
  {
    icon: PaperclipIcon,
    id: 'add-file',
    titleKey: 'chat.actions.addFile',
  },
] as const satisfies readonly ChatInputAction[];

const maxPhotoPreviewCount = 20;
const mediaTileSize = 112;
const chatInputActionSheetSnapPoints = ['50%', '70%'];
const StyledPressable = withUniwind(Pressable);

const photoPreviewQuery = () =>
  new MediaLibrary.Query()
    .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.IMAGE)
    .orderBy({ ascending: false, key: MediaLibrary.AssetField.CREATION_TIME })
    .limit(maxPhotoPreviewCount);

function readPhotoAccess(permission: MediaLibrary.PermissionResponse): PhotoAccess {
  const accessPrivileges = (
    permission as MediaLibrary.PermissionResponse & {
      accessPrivileges?: PhotoAccess;
    }
  ).accessPrivileges;

  if (!permission.granted) {
    return 'none';
  }

  return accessPrivileges ?? 'all';
}

async function loadPhotoPreviews() {
  const assets = await photoPreviewQuery().exe();
  const previews = await Promise.all(
    assets.map(async (asset) => ({
      id: asset.id,
      uri: await asset.getUri(),
    })),
  );

  return previews;
}

export function ChatInputActionSheet({ isOpen, onClose }: ChatInputActionSheetProps) {
  const { t } = useTranslation();
  const { theme } = useUniwind();
  const [photoAccess, setPhotoAccess] = useState<PhotoAccess | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const handleActionPress = useCallback(() => undefined, []);

  const selectedPhotoCount = selectedPhotoIds.length;
  const isDarkMode = theme === 'dark';
  const isPhotoAccessLimited = photoAccess === 'limited';
  const shouldShowPhotosTile = photoAccess !== 'all';

  const selectedPhotoOrder = useMemo(() => {
    const order = new Map<string, number>();
    selectedPhotoIds.forEach((photoId, index) => {
      order.set(photoId, index + 1);
    });

    return order;
  }, [selectedPhotoIds]);

  const refreshPhotoPermissionsAndPreviews = useCallback(async () => {
    const permission = await MediaLibrary.getPermissionsAsync(false, ['photo']);
    const access = readPhotoAccess(permission);

    setPhotoAccess(access);

    if (!permission.granted) {
      setPhotoPreviews([]);
      setSelectedPhotoIds([]);
      return;
    }

    const previews = await loadPhotoPreviews();
    const previewIds = new Set(previews.map((preview) => preview.id));

    setPhotoPreviews(previews);
    setSelectedPhotoIds((current) => current.filter((photoId) => previewIds.has(photoId)));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    async function refreshWhenMounted() {
      const permission = await MediaLibrary.getPermissionsAsync(false, ['photo']);
      const access = readPhotoAccess(permission);

      if (!isMounted) {
        return;
      }

      setPhotoAccess(access);

      if (!permission.granted) {
        setPhotoPreviews([]);
        setSelectedPhotoIds([]);
        return;
      }

      const previews = await loadPhotoPreviews();

      if (isMounted) {
        setPhotoPreviews(previews);
      }
    }

    void refreshWhenMounted().catch(() => {
      if (isMounted) {
        setPhotoAccess('none');
        setPhotoPreviews([]);
        setSelectedPhotoIds([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const launchCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    await refreshPhotoPermissionsAndPreviews();
  }, [refreshPhotoPermissionsAndPreviews]);

  const launchImageLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

    if (!permission.granted) {
      setPhotoAccess('none');
      return;
    }

    setPhotoAccess(permission.accessPrivileges ?? 'all');

    await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      orderedSelection: true,
      quality: 1,
      selectionLimit: maxPhotoPreviewCount,
    });

    await refreshPhotoPermissionsAndPreviews();
  }, [refreshPhotoPermissionsAndPreviews]);

  const presentLimitedPhotoPermissionsPicker = useCallback(async () => {
    await MediaLibrary.presentPermissionsPicker(['photo']);
    await refreshPhotoPermissionsAndPreviews();
  }, [refreshPhotoPermissionsAndPreviews]);

  const togglePhotoSelection = useCallback((photoId: string) => {
    setSelectedPhotoIds((current) => {
      if (current.includes(photoId)) {
        return current.filter((selectedPhotoId) => selectedPhotoId !== photoId);
      }

      return [...current, photoId];
    });
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPhotoIds([]);
    onClose();
  }, [onClose]);

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
            <View className="min-h-8 flex-row items-center justify-between gap-3">
              <Text className="font-semibold text-base text-foreground">
                {t('common.cherryStudio')}
              </Text>
              {photoAccess === 'all' ? (
                <StyledPressable
                  accessibilityLabel={t('chat.media.allPhotos')}
                  accessibilityRole="button"
                  className="rounded-full px-1 py-1 active:opacity-70"
                  onPress={launchImageLibrary}
                >
                  <Text className="font-medium text-foreground text-sm opacity-70">
                    {t('chat.media.allPhotos')}
                  </Text>
                </StyledPressable>
              ) : null}
              {isPhotoAccessLimited ? (
                <StyledPressable
                  accessibilityLabel={t('chat.media.limitedPhotoAccess')}
                  accessibilityRole="button"
                  className="flex-row items-center gap-1 rounded-full px-1 py-1 active:opacity-70"
                  onPress={presentLimitedPhotoPermissionsPicker}
                >
                  <Text className="font-medium text-foreground text-sm">
                    {t('chat.media.limitedPhotoAccess')}
                  </Text>
                  <InfoIcon className="size-4 text-foreground" strokeWidth={2} />
                </StyledPressable>
              ) : null}
            </View>
            <ScrollView
              horizontal
              alwaysBounceHorizontal={false}
              contentContainerStyle={styles.mediaPreviewContent}
              showsHorizontalScrollIndicator={false}
            >
              <MediaTile
                accessibilityLabel={t('chat.media.camera')}
                icon={CameraIcon}
                label={t('chat.media.camera')}
                onPress={launchCamera}
              />
              {shouldShowPhotosTile ? (
                <MediaTile
                  accessibilityLabel={t('chat.media.photos')}
                  icon={ImagesIcon}
                  label={t('chat.media.photos')}
                  onPress={launchImageLibrary}
                />
              ) : null}
              {photoPreviews.map((photo) => (
                <PhotoPreviewTile
                  accessibilityLabel={t('chat.media.photoPreview')}
                  key={photo.id}
                  selectionOrder={selectedPhotoOrder.get(photo.id)}
                  uri={photo.uri}
                  onPress={() => togglePhotoSelection(photo.id)}
                />
              ))}
            </ScrollView>
          </View>
          <View className="h-px bg-border" />
          <View className="gap-1">
            {chatInputActions.map((action) => {
              const Icon = action.icon;
              const title = t(action.titleKey);

              return (
                <StyledPressable
                  accessibilityLabel={title}
                  accessibilityRole="button"
                  className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
                  key={action.id}
                  onPress={handleActionPress}
                >
                  <Icon className="size-7 text-foreground" strokeWidth={2} />
                  <Text className="flex-1 font-semibold text-base text-foreground">{title}</Text>
                </StyledPressable>
              );
            })}
          </View>
        </View>
        {selectedPhotoCount > 0 ? (
          <View pointerEvents="box-none" style={[styles.floatingActionContainer, { bottom: 0 }]}>
            <StyledPressable
              accessibilityLabel={t('chat.media.addSelectedPhoto', { count: selectedPhotoCount })}
              accessibilityRole="button"
              className={[
                'items-center justify-center rounded-full py-3 active:opacity-80',
                isDarkMode ? 'bg-white' : 'bg-black',
              ].join(' ')}
              onPress={handleActionPress}
              style={styles.floatingActionButton}
            >
              <Text
                className={['font-semibold text-lg', isDarkMode ? 'text-black' : 'text-white'].join(
                  ' ',
                )}
              >
                {t('chat.media.addSelectedPhoto', { count: selectedPhotoCount })}
              </Text>
            </StyledPressable>
          </View>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
}

type MediaTileProps = {
  accessibilityLabel: string;
  icon: React.ComponentType<SvgProps>;
  label: string;
  onPress: () => void;
};

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

type PhotoPreviewTileProps = {
  accessibilityLabel: string;
  onPress: () => void;
  selectionOrder?: number;
  uri: string;
};

function PhotoPreviewTile({
  accessibilityLabel,
  onPress,
  selectionOrder,
  uri,
}: PhotoPreviewTileProps) {
  const isSelected = typeof selectionOrder === 'number';

  return (
    <StyledPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={[
        'items-center justify-center overflow-hidden rounded-2xl bg-surface-secondary active:opacity-80',
        isSelected ? 'border-[3px]' : '',
      ].join(' ')}
      onPress={onPress}
      style={[styles.mediaTile, isSelected ? styles.photoPreviewTileSelected : null]}
    >
      <Image contentFit="cover" source={{ uri }} style={StyleSheet.absoluteFill} />
      {isSelected ? (
        <View
          className="items-center justify-center rounded-full"
          style={[styles.photoSelectionBadge, styles.photoSelectionBadgeSelected]}
        >
          <Text className="font-semibold text-sm" style={styles.photoSelectionBadgeText}>
            {selectionOrder}
          </Text>
        </View>
      ) : (
        <View
          className="rounded-full"
          style={[styles.photoSelectionBadge, styles.photoSelectionBadgeUnselected]}
        />
      )}
    </StyledPressable>
  );
}

const styles = StyleSheet.create({
  floatingActionButton: {
    alignSelf: 'center',
    width: '85%',
  },
  floatingActionContainer: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
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
  photoSelectionBadgeText: {
    color: '#000000',
  },
  photoSelectionBadgeUnselected: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  sheetContent: {
    paddingBottom: 28,
  },
  sheetViewport: {
    flex: 1,
    position: 'relative',
  },
});
