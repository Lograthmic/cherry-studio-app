import { resolveIcon } from '@cherrystudio/ui/icons';
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
  const iconSource = resolveIcon(
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

  if (iconSource) {
    return (
      <View
        className="items-center justify-center overflow-hidden"
        style={[styles.iconFrame, frameStyle]}
      >
        <Image
          cachePolicy="memory-disk"
          contentFit="contain"
          recyclingKey={item.modelId}
          source={iconSource[iconTheme]}
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
