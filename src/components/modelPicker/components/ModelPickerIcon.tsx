import { resolveModelIcon } from '@cherrystudio/ui/icons';
import { resolveModelProviderIcon } from '@cherrystudio/ui/icons-png';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { useUniwind } from 'uniwind';

import type { ModelPickerModelItem } from '../utils/modelPickerData';

type ModelPickerIconProps = {
  item: ModelPickerModelItem;
  providerIconSize?: number;
  size?: number;
};

export function ModelPickerIcon({ item, providerIconSize, size = 32 }: ModelPickerIconProps) {
  const { theme } = useUniwind();
  const iconTheme = theme === 'dark' ? 'dark' : 'light';
  const modelIcon = resolveModelIcon(item.modelIdentifier);
  const providerIconSource = resolveModelProviderIcon(
    item.modelIdentifier,
    item.provider.presetProviderId ?? item.provider.id,
  );
  const avatarInitial = item.model.name.trim().charAt(0).toUpperCase() || 'M';
  const frameStyle = {
    borderRadius: size / 2,
    height: size,
    width: size,
  };
  const imageSize = providerIconSize ?? Math.round(size * 0.8125);

  if (modelIcon) {
    const Avatar = modelIcon.Avatar;

    return <Avatar background="transparent" size={size} />;
  }

  if (providerIconSource) {
    return (
      <View
        className="items-center justify-center overflow-hidden"
        style={[styles.iconFrame, frameStyle]}
      >
        <Image
          cachePolicy="memory-disk"
          contentFit="contain"
          recyclingKey={item.modelId}
          source={providerIconSource[iconTheme]}
          style={{
            height: imageSize,
            width: imageSize,
          }}
        />
      </View>
    );
  }

  return (
    <View className="items-center justify-center" style={frameStyle}>
      <Text className="font-medium text-default-foreground text-xs">{avatarInitial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    borderCurve: 'continuous',
  },
});
