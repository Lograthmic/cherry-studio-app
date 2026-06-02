import { MODEL_CAPABILITY } from '@cherrystudio/provider-registry';
import { cn } from 'heroui-native/utils';
import {
  AudioLinesIcon,
  BrainIcon,
  EyeIcon,
  GlobeIcon,
  SparklesIcon,
  WrenchIcon,
} from 'lucide-uniwind';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ModelPickerTag } from '../utils/modelPickerData';
import { getModelPickerTagLabelKey } from '../utils/modelPickerData';

type ModelPickerTagChipProps = {
  isActive?: boolean;
  onPress?: () => void;
  showLabel?: boolean;
  size?: 'md' | 'sm';
  tag: ModelPickerTag;
};

type ModelPickerTagMeta = {
  color: string;
  renderIcon: (color: string, label: string, size: ModelPickerTagChipProps['size']) => ReactNode;
  respectsShowLabel: boolean;
};

export function ModelPickerTagChip({
  isActive = true,
  onPress,
  showLabel = false,
  size = 'sm',
  tag,
}: ModelPickerTagChipProps) {
  const { t } = useTranslation();
  const meta = modelPickerTagMeta[tag];
  const label = t(getModelPickerTagLabelKey(tag));
  const actualColor = isActive ? meta.color : '#aaaaaa';
  const Container = onPress ? Pressable : View;

  return (
    <Container
      accessibilityLabel={label}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: isActive } : undefined}
      accessible
      className={cn(
        'flex-row items-center justify-center gap-1 rounded-lg',
        size === 'md' ? 'h-6 px-2' : 'h-5 px-1.5',
        onPress ? 'active:opacity-70' : null,
      )}
      onPress={onPress}
      style={{
        backgroundColor: withAlpha(actualColor, '20'),
      }}
    >
      {meta.renderIcon(actualColor, label, size)}
      {meta.respectsShowLabel && showLabel ? (
        <Text
          className={cn('font-medium', size === 'md' ? 'text-sm' : 'text-xs')}
          style={{ color: actualColor }}
        >
          {label}
        </Text>
      ) : null}
    </Container>
  );
}

const modelPickerTagMeta = {
  [MODEL_CAPABILITY.AUDIO_RECOGNITION]: createIconTagMeta('#d946ef', AudioLinesIcon),
  [MODEL_CAPABILITY.CODE_EXECUTION]: createIconTagMeta('#f18737', WrenchIcon),
  [MODEL_CAPABILITY.EMBEDDING]: createTextTagMeta('#FFA500'),
  [MODEL_CAPABILITY.FUNCTION_CALL]: createIconTagMeta('#f18737', WrenchIcon),
  [MODEL_CAPABILITY.IMAGE_GENERATION]: createIconTagMeta('#00b96b', SparklesIcon),
  [MODEL_CAPABILITY.IMAGE_RECOGNITION]: createIconTagMeta('#00b96b', EyeIcon),
  [MODEL_CAPABILITY.REASONING]: createIconTagMeta('#6372bd', BrainIcon),
  [MODEL_CAPABILITY.RERANK]: createTextTagMeta('#6495ED'),
  [MODEL_CAPABILITY.WEB_SEARCH]: createIconTagMeta('#1677ff', GlobeIcon),
  free: createTextTagMeta('#7cb305'),
} satisfies Record<ModelPickerTag, ModelPickerTagMeta>;

function createIconTagMeta(color: string, Icon: typeof EyeIcon): ModelPickerTagMeta {
  return {
    color,
    renderIcon: (iconColor, _label, size) => (
      <Icon
        color={iconColor}
        height={size === 'md' ? 14 : 12}
        strokeWidth={2}
        width={size === 'md' ? 14 : 12}
      />
    ),
    respectsShowLabel: true,
  };
}

function createTextTagMeta(color: string): ModelPickerTagMeta {
  return {
    color,
    renderIcon: (iconColor, label, size) => (
      <TextTagIcon color={iconColor} label={label} size={size} />
    ),
    respectsShowLabel: false,
  };
}

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

function TextTagIcon({
  color,
  label,
  size,
}: {
  color?: string;
  label: string;
  size: ModelPickerTagChipProps['size'];
}) {
  return (
    <Text
      className={cn('font-medium', size === 'md' ? 'text-sm' : 'text-xs')}
      style={[styles.textTagIcon, { color, lineHeight: size === 'md' ? 16 : 14 }]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  textTagIcon: {
    includeFontPadding: false,
    textAlign: 'center',
  },
});
