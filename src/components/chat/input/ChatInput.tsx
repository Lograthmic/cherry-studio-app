import { TextArea } from 'heroui-native/text-area';
import { PlusIcon } from 'lucide-uniwind';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  type WithTimingConfig,
  withTiming,
} from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import {
  chatInputControlGap,
  chatInputMaxTextAreaHeight,
  chatInputMergedAddButtonSlotWidth,
  chatInputMinTextAreaHeight,
} from '@/components/chat/input/chatInputLayout';
import { ChatInputActionSheet } from './ChatInputActionSheet';

const mergedInputOffset = chatInputMinTextAreaHeight + chatInputControlGap;
const inputSurfaceClassName =
  'border-[1.5px] border-field-border bg-field ios:shadow-field android:shadow-sm';
const inputSurfaceBackgroundClassName = `absolute inset-0 rounded-3xl ${inputSurfaceClassName}`;
const transparentInputSurfaceClassName =
  'border-0 bg-transparent shadow-none ios:shadow-none android:shadow-none';
const chatInputTimingConfig = {
  duration: 180,
  easing: Easing.out(Easing.cubic),
  reduceMotion: ReduceMotion.Never,
} as const satisfies WithTimingConfig;

const StyledAnimatedView = withUniwind(Animated.View);
const StyledPressable = withUniwind(Pressable);
const inputSurfaceStyle = {
  maxHeight: chatInputMaxTextAreaHeight,
  minHeight: chatInputMinTextAreaHeight,
};
const styles = StyleSheet.create({
  transparentInputSurface: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
    elevation: 0,
  },
});

export function ChatInput() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withTiming(isInputFocused ? 1 : 0, chatInputTimingConfig);
  }, [focusProgress, isInputFocused]);

  const controlGroupStyle = useAnimatedStyle(() => ({
    marginLeft: ((1 - focusProgress.value) * mergedInputOffset) / 2,
    marginRight: ((1 - focusProgress.value) * mergedInputOffset) / 2,
  }));

  const controlGapStyle = useAnimatedStyle(() => ({
    width: focusProgress.value * chatInputControlGap,
  }));

  const addButtonSlotStyle = useAnimatedStyle(() => ({
    width:
      chatInputMergedAddButtonSlotWidth +
      focusProgress.value * (chatInputMinTextAreaHeight - chatInputMergedAddButtonSlotWidth),
  }));

  const handleActionSheetOpen = useCallback(() => {
    Keyboard.dismiss();
    setIsInputFocused(false);
    setIsActionSheetOpen(true);
  }, []);

  const handleActionSheetClose = useCallback(() => {
    setIsActionSheetOpen(false);
  }, []);

  return (
    <>
      <View className="flex-row items-end">
        <StyledAnimatedView
          className="flex-1 flex-row items-end"
          style={[inputSurfaceStyle, controlGroupStyle]}
        >
          {isInputFocused ? null : (
            <View className={inputSurfaceBackgroundClassName} pointerEvents="none" />
          )}
          <Animated.View style={addButtonSlotStyle}>
            <StyledPressable
              accessibilityLabel="Add"
              accessibilityRole="button"
              className={[
                'items-center justify-center rounded-full active:opacity-70',
                isInputFocused ? inputSurfaceClassName : '',
              ].join(' ')}
              hitSlop={6}
              onPress={handleActionSheetOpen}
              style={{
                height: chatInputMinTextAreaHeight,
                width: chatInputMinTextAreaHeight,
              }}
            >
              <PlusIcon className="size-5 text-foreground" strokeWidth={2} />
            </StyledPressable>
          </Animated.View>
          <Animated.View style={controlGapStyle} />
          <View className="flex-1" style={inputSurfaceStyle}>
            {isInputFocused ? (
              <View className={inputSurfaceBackgroundClassName} pointerEvents="none" />
            ) : null}
            <TextArea
              multiline
              className={[
                'h-auto flex-1 rounded-3xl py-3 pr-4 text-base leading-5',
                transparentInputSurfaceClassName,
                isInputFocused ? '' : 'pl-1',
              ].join(' ')}
              numberOfLines={6}
              placeholder={t('chat.inputPlaceholder')}
              style={[
                styles.transparentInputSurface,
                {
                  maxHeight: chatInputMaxTextAreaHeight,
                  minHeight: chatInputMinTextAreaHeight,
                  textAlignVertical: 'center',
                },
              ]}
              value={draft}
              onBlur={() => setIsInputFocused(false)}
              onChangeText={setDraft}
              onFocus={() => setIsInputFocused(true)}
            />
          </View>
        </StyledAnimatedView>
      </View>
      <ChatInputActionSheet isOpen={isActionSheetOpen} onClose={handleActionSheetClose} />
    </>
  );
}
