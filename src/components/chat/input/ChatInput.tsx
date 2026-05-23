import { TextArea } from 'heroui-native/text-area';
import { PlusIcon } from 'lucide-uniwind';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  type WithTimingConfig,
  withTiming,
} from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import {
  type ChatInputActionId,
  chatInputActions,
} from '@/components/chat/input/ChatInputActionList';
import {
  chatInputControlGap,
  chatInputMaxTextAreaHeight,
  chatInputMergedAddButtonSlotWidth,
  chatInputMinTextAreaHeight,
} from '@/components/chat/input/chatInputLayout';
import { ChatInputActionSheet } from './ChatInputActionSheet';
import { ChatInputToolbar } from './ChatInputToolbar';

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
const chatInputLayoutTransition = LinearTransition.duration(chatInputTimingConfig.duration)
  .easing(chatInputTimingConfig.easing)
  .reduceMotion(chatInputTimingConfig.reduceMotion);
const chatInputFocusAfterActionDelay = 100;

const StyledAnimatedView = withUniwind(Animated.View);
const StyledPressable = withUniwind(Pressable);
const inputControlSurfaceStyle = {
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
  const inputRef = useRef<TextInput>(null);
  const focusAfterActionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldFocusAfterActionSheetCloseRef = useRef(false);
  const [draft, setDraft] = useState('');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<ChatInputActionId | null>(null);
  const surfaceContentProgress = useSharedValue(0);
  const selectedTool = useMemo(
    () => chatInputActions.find((action) => action.id === selectedToolId),
    [selectedToolId],
  );
  const hasSurfaceContent = isInputFocused || selectedTool !== undefined;

  useEffect(() => {
    surfaceContentProgress.value = withTiming(hasSurfaceContent ? 1 : 0, chatInputTimingConfig);
  }, [hasSurfaceContent, surfaceContentProgress]);

  useEffect(() => {
    return () => {
      if (focusAfterActionTimeoutRef.current) {
        clearTimeout(focusAfterActionTimeoutRef.current);
      }
    };
  }, []);

  const controlGroupStyle = useAnimatedStyle(() => ({
    marginLeft: ((1 - surfaceContentProgress.value) * mergedInputOffset) / 2,
    marginRight: ((1 - surfaceContentProgress.value) * mergedInputOffset) / 2,
  }));

  const controlGapStyle = useAnimatedStyle(() => ({
    width: surfaceContentProgress.value * chatInputControlGap,
  }));

  const mergedSurfaceStyle = useAnimatedStyle(() => ({
    opacity: 1 - surfaceContentProgress.value,
  }));

  const separatedSurfaceStyle = useAnimatedStyle(() => ({
    opacity: surfaceContentProgress.value,
  }));

  const addButtonSlotStyle = useAnimatedStyle(() => ({
    alignSelf: 'flex-end',
    width:
      chatInputMergedAddButtonSlotWidth +
      surfaceContentProgress.value *
        (chatInputMinTextAreaHeight - chatInputMergedAddButtonSlotWidth),
  }));

  const handleActionSheetOpen = useCallback(() => {
    inputRef.current?.blur();
    Keyboard.dismiss();
    setIsInputFocused(false);
    setIsActionSheetOpen(true);
  }, []);

  const handleActionSheetClose = useCallback(() => {
    setIsActionSheetOpen(false);

    if (!shouldFocusAfterActionSheetCloseRef.current) {
      return;
    }

    shouldFocusAfterActionSheetCloseRef.current = false;

    if (focusAfterActionTimeoutRef.current) {
      clearTimeout(focusAfterActionTimeoutRef.current);
    }

    // Native sheet close callbacks fire before the dismissal animation has released focus.
    focusAfterActionTimeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
      focusAfterActionTimeoutRef.current = null;
    }, chatInputFocusAfterActionDelay);
  }, []);

  const handleActionSelect = useCallback((actionId: ChatInputActionId) => {
    setSelectedToolId((currentActionId) => (currentActionId === actionId ? null : actionId));
    shouldFocusAfterActionSheetCloseRef.current = true;
  }, []);

  const handleSelectedToolClear = useCallback(() => {
    setSelectedToolId(null);
  }, []);

  return (
    <>
      <View className="flex-row items-end">
        <StyledAnimatedView
          className="flex-1 flex-row items-end"
          layout={chatInputLayoutTransition}
          style={[inputControlSurfaceStyle, controlGroupStyle]}
        >
          <StyledAnimatedView
            className={inputSurfaceBackgroundClassName}
            pointerEvents="none"
            style={mergedSurfaceStyle}
          />
          <Animated.View layout={chatInputLayoutTransition} style={addButtonSlotStyle}>
            <StyledPressable
              accessibilityLabel="Add"
              accessibilityRole="button"
              className="items-center justify-center rounded-full active:opacity-70"
              hitSlop={6}
              onPress={handleActionSheetOpen}
              style={{
                height: chatInputMinTextAreaHeight,
                width: chatInputMinTextAreaHeight,
              }}
            >
              <StyledAnimatedView
                className={`absolute inset-0 rounded-full ${inputSurfaceClassName}`}
                pointerEvents="none"
                style={separatedSurfaceStyle}
              />
              <PlusIcon className="size-5 text-foreground" strokeWidth={2} />
            </StyledPressable>
          </Animated.View>
          <Animated.View style={controlGapStyle} />
          <StyledAnimatedView
            className="flex-1"
            layout={chatInputLayoutTransition}
            style={inputControlSurfaceStyle}
          >
            <StyledAnimatedView
              className={inputSurfaceBackgroundClassName}
              pointerEvents="none"
              style={separatedSurfaceStyle}
            />
            <StyledAnimatedView
              className="overflow-hidden rounded-3xl"
              layout={chatInputLayoutTransition}
            >
              <ChatInputToolbar selectedTool={selectedTool} onToolClear={handleSelectedToolClear} />
              <TextArea
                ref={inputRef}
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
            </StyledAnimatedView>
          </StyledAnimatedView>
        </StyledAnimatedView>
      </View>
      <ChatInputActionSheet
        isOpen={isActionSheetOpen}
        onActionSelect={handleActionSelect}
        onClose={handleActionSheetClose}
        selectedActionId={selectedToolId}
      />
    </>
  );
}
