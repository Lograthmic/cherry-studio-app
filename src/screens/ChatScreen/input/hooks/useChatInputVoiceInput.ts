import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';
import { loggerService } from '@/core/logger/loggerService';
import { usePreference } from '@/data/hooks';
import { resolveLanguage } from '@/i18n';
import {
  useChatInputActions,
  useChatInputMeta,
  useChatInputState,
} from '@/screens/ChatScreen/input/context/ChatInputProvider';
import {
  appendVoiceInputVolumeSample,
  mergeVoiceInputDraft,
} from '@/screens/ChatScreen/input/utils/chatInputVoiceInput';
import {
  type VoiceInputError,
  type VoiceInputStatus,
  voiceInputService,
} from '@/service/chat/voice';

const voiceInputVolumeSampleLimit = 16;
const logger = loggerService.withContext('ChatInputVoiceInput');

type ChatInputVoiceInputState = {
  error: VoiceInputError | null;
  isListening: boolean;
  status: VoiceInputStatus;
};

export function useChatInputVoiceInput() {
  const { setDraft, setInputFocused } = useChatInputActions();
  const { inputRef } = useChatInputMeta();
  const { draft } = useChatInputState();
  const [preferenceLanguage] = usePreference('app.language');
  const draftRef = useRef(draft);
  const baseDraftRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const shouldCommitOnEndRef = useRef(false);
  const transcriptRef = useRef('');
  const volumeSamples = useSharedValue<readonly number[]>([]);
  const [voiceInputState, setVoiceInputState] = useState<ChatInputVoiceInputState>({
    error: voiceInputService.getError(),
    isListening: voiceInputService.getStatus() === 'listening',
    status: voiceInputService.getStatus(),
  });

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    isMountedRef.current = true;
    const syncVoiceInputState = () => {
      const nextStatus = voiceInputService.getStatus();

      setVoiceInputState((current) => ({
        ...current,
        error: voiceInputService.getError(),
        isListening: nextStatus === 'listening',
        status: nextStatus,
      }));
    };

    const unsubscribe = voiceInputService.subscribe((event) => {
      if (!isMountedRef.current) {
        return;
      }

      switch (event.type) {
        case 'start':
          syncVoiceInputState();
          transcriptRef.current = '';
          shouldCommitOnEndRef.current = true;
          setInputFocused(false);
          volumeSamples.value = [];
          break;
        case 'partial':
        case 'final':
          transcriptRef.current = event.text;
          break;
        case 'volume':
          volumeSamples.value = appendVoiceInputVolumeSample(
            volumeSamples.value,
            event.value,
            voiceInputVolumeSampleLimit,
          );
          break;
        case 'end':
          syncVoiceInputState();
          if (shouldCommitOnEndRef.current) {
            setDraft(mergeVoiceInputDraft(baseDraftRef.current ?? '', transcriptRef.current));
          }

          baseDraftRef.current = null;
          shouldCommitOnEndRef.current = false;
          transcriptRef.current = '';
          volumeSamples.value = [];
          break;
        case 'error':
          syncVoiceInputState();
          logger.warn('Voice input failed', {
            code: event.error.code,
            message: event.error.message,
          });

          if (event.error.code !== 'cancelled') {
            baseDraftRef.current = null;
            shouldCommitOnEndRef.current = false;
            transcriptRef.current = '';
          }
          break;
      }
    });

    return () => {
      isMountedRef.current = false;

      baseDraftRef.current = null;
      shouldCommitOnEndRef.current = false;
      transcriptRef.current = '';
      volumeSamples.value = [];

      const status = voiceInputService.getStatus();
      if (
        status === 'requesting-permission' ||
        status === 'listening' ||
        status === 'transcribing'
      ) {
        void voiceInputService
          .cancel()
          .catch((error) => {
            logger.warn('Failed to cancel voice input on unmount', error);
          })
          .finally(() => {
            unsubscribe();
          });
        return;
      }

      unsubscribe();
    };
  }, [setInputFocused, setDraft, volumeSamples]);

  const start = useCallback(async () => {
    baseDraftRef.current = draftRef.current;
    shouldCommitOnEndRef.current = true;
    transcriptRef.current = '';
    inputRef.current?.blur();
    Keyboard.dismiss();
    setInputFocused(false);
    setVoiceInputState({
      error: null,
      isListening: false,
      status: 'requesting-permission',
    });
    volumeSamples.value = [];

    await voiceInputService.start({ lang: resolveLanguage(preferenceLanguage) });

    if (!isMountedRef.current) {
      return;
    }

    const nextStatus = voiceInputService.getStatus();
    setVoiceInputState((current) => ({
      ...current,
      error: voiceInputService.getError(),
      isListening: nextStatus === 'listening',
      status: nextStatus,
    }));
  }, [inputRef, preferenceLanguage, setInputFocused, volumeSamples]);

  const stop = useCallback(async () => {
    await voiceInputService.stop();

    if (!isMountedRef.current) {
      return;
    }

    const nextStatus = voiceInputService.getStatus();
    setVoiceInputState((current) => ({
      ...current,
      error: voiceInputService.getError(),
      isListening: nextStatus === 'listening',
      status: nextStatus,
    }));
  }, []);

  const stopAndCommit = useCallback(async () => {
    shouldCommitOnEndRef.current = true;
    await stop();
  }, [stop]);

  const cancel = useCallback(async () => {
    const baseDraft = baseDraftRef.current;
    shouldCommitOnEndRef.current = false;
    transcriptRef.current = '';

    await voiceInputService.cancel();

    if (!isMountedRef.current) {
      return;
    }

    if (baseDraft !== null) {
      setDraft(baseDraft);
      baseDraftRef.current = null;
    }

    const nextStatus = voiceInputService.getStatus();
    setVoiceInputState((current) => ({
      ...current,
      error: voiceInputService.getError(),
      isListening: nextStatus === 'listening',
      status: nextStatus,
    }));
    volumeSamples.value = [];
  }, [setDraft, volumeSamples]);

  const clearError = useCallback(() => {
    voiceInputService.clearError();
    setVoiceInputState((current) => ({ ...current, error: null }));
  }, []);

  const toggle = useCallback(async () => {
    if (voiceInputService.getStatus() === 'listening') {
      await stopAndCommit();
      return;
    }

    await start();
  }, [start, stopAndCommit]);

  const isVoiceActive =
    voiceInputState.isListening ||
    voiceInputState.status === 'requesting-permission' ||
    voiceInputState.status === 'transcribing';

  return {
    ...voiceInputState,
    cancel,
    clearError,
    isVoiceActive,
    start,
    stop,
    stopAndCommit,
    toggle,
    volumeSamples,
  };
}

export type ChatInputVoiceVolumeSamples = SharedValue<readonly number[]>;
