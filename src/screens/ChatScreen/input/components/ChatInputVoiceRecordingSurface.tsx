import { ArrowUpIcon, SquareIcon } from 'lucide-uniwind';
import { Pressable, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { chatInputMinTextAreaHeight } from '@/screens/ChatScreen/input/chatInputLayout';

const actionButtonSize = 32;
const barCount = 16;
const barMaxHeight = 24;
const barMinHeight = 4;
const barIds = Array.from({ length: barCount }, (_, index) => `voice-volume-bar-${index}`);

type ChatInputVoiceRecordingSurfaceProps = {
  isBusy: boolean;
  volumeSamples: SharedValue<readonly number[]>;
  onSendPress: () => void | Promise<void>;
  onStopPress: () => void | Promise<void>;
};

type VoiceVolumeBarProps = {
  index: number;
  volumeSamples: SharedValue<readonly number[]>;
};

function VoiceVolumeBar({ index, volumeSamples }: VoiceVolumeBarProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const samples = volumeSamples.value;
    const paddedSampleOffset = Math.max(barCount - samples.length, 0);
    const sampleIndex = index - paddedSampleOffset;
    const sample = sampleIndex >= 0 ? (samples[sampleIndex] ?? 0) : 0;

    return {
      height: barMinHeight + sample * (barMaxHeight - barMinHeight),
      opacity: 0.45 + sample * 0.45,
    };
  });

  return <Animated.View className="w-1 rounded-full bg-default-foreground" style={animatedStyle} />;
}

export function ChatInputVoiceRecordingSurface({
  isBusy,
  volumeSamples,
  onSendPress,
  onStopPress,
}: ChatInputVoiceRecordingSurfaceProps) {
  return (
    <View
      className="flex-1 flex-row items-center gap-3 rounded-3xl bg-field px-1.5 ios:shadow-field android:shadow-sm"
      style={{ minHeight: chatInputMinTextAreaHeight }}
    >
      <Pressable
        accessibilityLabel="Stop voice input"
        accessibilityRole="button"
        className="items-center justify-center rounded-full bg-background active:opacity-70 disabled:opacity-70"
        disabled={isBusy}
        hitSlop={6}
        onPress={onStopPress}
        style={{ height: actionButtonSize, width: actionButtonSize }}
      >
        <SquareIcon className="size-5 text-foreground" fill="currentColor" strokeWidth={0} />
      </Pressable>

      <View className="min-w-0 flex-1 flex-row items-center justify-center gap-1">
        {barIds.map((barId, index) => (
          <VoiceVolumeBar index={index} key={barId} volumeSamples={volumeSamples} />
        ))}
      </View>

      <Pressable
        accessibilityLabel="Use voice input"
        accessibilityRole="button"
        className="items-center justify-center rounded-full bg-primary active:opacity-70 disabled:opacity-70"
        disabled={isBusy}
        hitSlop={6}
        onPress={onSendPress}
        style={{ height: actionButtonSize, width: actionButtonSize }}
      >
        <ArrowUpIcon className="size-5 text-foreground" strokeWidth={2} />
      </Pressable>
    </View>
  );
}
