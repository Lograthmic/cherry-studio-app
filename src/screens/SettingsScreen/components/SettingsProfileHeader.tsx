import {
  BottomSheet,
  type BottomSheetMethods,
  BottomSheetTextInput,
  BottomSheetView,
} from '@expo/ui/community/bottom-sheet';
import { type MenuAction, MenuView, type NativeActionEvent } from '@expo/ui/community/menu';
import { Image, type ImageSource } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColor } from 'heroui-native/hooks';
import { CameraIcon, PencilIcon } from 'lucide-uniwind';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

import { usePreference } from '@/data/hooks';

const avatarSource = require('@/assets/icon.png');
const avatarSize = 72;
const sheetAvatarSize = 104;
const profileSheetSnapPoints = ['60%'];

const StyledBottomSheetTextInput = withUniwind(BottomSheetTextInput);

export function SettingsProfileHeader() {
  const { t } = useTranslation();
  const [userName, setUserName] = usePreference('app.user.name');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [draftAvatarUri, setDraftAvatarUri] = useState<string | null>(null);
  const sheetRef = useRef<BottomSheetMethods>(null);

  const openSheet = useCallback(() => {
    Keyboard.dismiss();
    setDraftName(userName);
    setDraftAvatarUri(null);
    setIsSheetOpen(true);
  }, [userName]);

  const closeSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const cancelEdit = useCallback(() => {
    Keyboard.dismiss();
    sheetRef.current?.close();
  }, []);

  const saveProfile = useCallback(() => {
    Keyboard.dismiss();
    void setUserName(draftName, { optimistic: true }).then(() => {
      sheetRef.current?.close();
    });
  }, [draftName, setUserName]);

  return (
    <>
      <Pressable
        accessibilityLabel={t('settings.profile.edit')}
        accessibilityRole="button"
        className="items-center gap-3 active:opacity-70"
        onPress={openSheet}
      >
        <EditableAvatar icon="pencil" size={avatarSize} />
        <Text className="min-h-7 font-semibold text-2xl text-foreground" numberOfLines={1}>
          {userName}
        </Text>
      </Pressable>
      <BottomSheet
        enablePanDownToClose
        enableDynamicSizing={false}
        handleComponent={null}
        index={isSheetOpen ? 0 : -1}
        ref={sheetRef}
        snapPoints={profileSheetSnapPoints}
        onClose={closeSheet}
      >
        <BottomSheetView style={styles.sheetViewport}>
          <SettingsProfileEditor
            draftAvatarUri={draftAvatarUri}
            draftName={draftName}
            onCancel={cancelEdit}
            onDraftAvatarUriChange={setDraftAvatarUri}
            onDraftNameChange={setDraftName}
            onSave={saveProfile}
          />
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

type SettingsProfileEditorProps = {
  draftAvatarUri: string | null;
  draftName: string;
  onCancel: () => void;
  onDraftAvatarUriChange: (uri: string) => void;
  onDraftNameChange: (name: string) => void;
  onSave: () => void;
};

type AvatarSourceValue = 'camera' | 'photos';

function SettingsProfileEditor({
  draftAvatarUri,
  draftName,
  onCancel,
  onDraftAvatarUriChange,
  onDraftNameChange,
  onSave,
}: SettingsProfileEditorProps) {
  const { t } = useTranslation();
  const borderColor = useThemeColor('border');
  const avatarActions = useMemo<MenuAction[]>(
    () => [
      {
        id: 'camera',
        image: 'camera',
        title: t('chat.media.camera'),
      },
      {
        id: 'photos',
        image: 'photo',
        title: t('chat.media.photos'),
      },
    ],
    [t],
  );

  const selectAvatarFromCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 1,
    });

    const assetUri = result.canceled ? undefined : result.assets[0]?.uri;
    if (assetUri) {
      onDraftAvatarUriChange(assetUri);
    }
  }, [onDraftAvatarUriChange]);

  const selectAvatarFromPhotoLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 1,
      selectionLimit: 1,
    });

    const assetUri = result.canceled ? undefined : result.assets[0]?.uri;
    if (assetUri) {
      onDraftAvatarUriChange(assetUri);
    }
  }, [onDraftAvatarUriChange]);

  const handleAvatarSourceChange = useCallback(
    (event: NativeActionEvent) => {
      const nextValue = event.nativeEvent.event as AvatarSourceValue;

      if (nextValue === 'camera') {
        void selectAvatarFromCamera();
        return;
      }

      if (nextValue === 'photos') {
        void selectAvatarFromPhotoLibrary();
      }
    },
    [selectAvatarFromCamera, selectAvatarFromPhotoLibrary],
  );

  return (
    <View style={styles.sheetContent}>
      <View className="gap-6 px-6" style={styles.sheetForm}>
        <View style={styles.sheetAvatarHeader}>
          <MenuAvatarTrigger
            actions={avatarActions}
            accessibilityLabel={t('settings.profile.changeAvatar')}
            imageSource={draftAvatarUri ? { uri: draftAvatarUri } : undefined}
            onPressAction={handleAvatarSourceChange}
            size={sheetAvatarSize}
          />
          {draftName ? (
            <Text className="font-semibold text-xl text-foreground" numberOfLines={1}>
              {draftName}
            </Text>
          ) : null}
        </View>
        <View className="gap-2">
          <Text className="font-medium text-foreground text-sm">
            {t('settings.profile.userName')}
          </Text>
          <StyledBottomSheetTextInput
            accessibilityLabel={t('settings.profile.name')}
            autoCorrect={false}
            className="rounded-2xl px-4 text-base text-foreground leading-5 "
            onChangeText={onDraftNameChange}
            onSubmitEditing={onSave}
            returnKeyType="done"
            style={[styles.input, { borderColor }]}
            value={draftName}
          />
        </View>
      </View>
      <View className="items-center gap-4 px-6" style={styles.sheetFooter}>
        <Pressable
          accessibilityLabel={t('common.save')}
          accessibilityRole="button"
          className="items-center justify-center rounded-full bg-foreground px-6 py-1 active:opacity-80"
          onPress={onSave}
        >
          <Text className="font-semibold text-lg">{t('common.save')}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
          className="px-6 py-1 active:opacity-70"
          onPress={onCancel}
        >
          <Text className="text-foreground text-lg">{t('common.cancel')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

type EditableAvatarProps = {
  icon: 'camera' | 'pencil';
  imageSource?: ImageSource | number;
  size: number;
};

function EditableAvatar({ icon, imageSource, size }: EditableAvatarProps) {
  return (
    <View style={{ height: size, width: size }}>
      <AvatarImage imageSource={imageSource} size={size} />
      <AvatarEditBadge icon={icon} size={size} />
    </View>
  );
}

type MenuAvatarTriggerProps = {
  accessibilityLabel: string;
  actions: MenuAction[];
  imageSource?: ImageSource | number;
  onPressAction: (event: NativeActionEvent) => void;
  size: number;
};

function MenuAvatarTrigger({
  accessibilityLabel,
  actions,
  imageSource,
  onPressAction,
  size,
}: MenuAvatarTriggerProps) {
  return (
    <View style={{ height: size, width: size }}>
      <AvatarImage imageSource={imageSource} size={size} />
      <MenuView actions={actions} onPressAction={onPressAction} style={styles.avatarMenuTrigger}>
        <View
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          onTouchStart={() => Keyboard.dismiss()}
          style={{ height: size, width: size }}
        >
          <AvatarEditBadge icon="camera" size={size} />
        </View>
      </MenuView>
    </View>
  );
}

type AvatarImageProps = {
  imageSource?: ImageSource | number;
  size: number;
};

function AvatarImage({ imageSource, size }: AvatarImageProps) {
  const source = imageSource ?? avatarSource;

  return (
    <Image
      accessibilityIgnoresInvertColors
      cachePolicy="memory-disk"
      source={source}
      style={{ borderRadius: size / 2, height: size, width: size }}
    />
  );
}

type AvatarEditBadgeProps = {
  icon: 'camera' | 'pencil';
  size: number;
};

function AvatarEditBadge({ icon, size }: AvatarEditBadgeProps) {
  const iconColor = useThemeColor('foreground');
  const badgeSize = Math.round(size * 0.32);
  const Icon = icon === 'camera' ? CameraIcon : PencilIcon;

  return (
    <View
      className="bg-surface border border-border"
      style={[
        styles.avatarEditBadge,
        {
          borderRadius: badgeSize / 2,
          height: badgeSize,
          width: badgeSize,
        },
      ]}
    >
      <Icon color={iconColor} size={Math.round(badgeSize * 0.5)} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarEditBadge: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
  },
  avatarMenuTrigger: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  input: {
    borderWidth: 1,
    height: 48,
    includeFontPadding: false,
    paddingBottom: 0,
    paddingTop: 0,
    textAlignVertical: 'center',
    verticalAlign: 'middle',
  },
  sheetAvatarHeader: {
    alignItems: 'center',
    gap: 12,
    height: 144,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    flex: 1,
  },
  sheetFooter: {
    paddingBottom: 32,
    paddingTop: 16,
  },
  sheetForm: {
    flex: 1,
  },
  sheetViewport: {
    flex: 1,
  },
});
