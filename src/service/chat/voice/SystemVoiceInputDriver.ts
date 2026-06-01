import type { EventSubscription } from 'expo-modules-core';
import {
  type ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';
import {
  type VoiceInputDriver,
  type VoiceInputError,
  type VoiceInputEvent,
  type VoiceInputEventListener,
  type VoiceInputStartOptions,
} from './types';

function toVoiceInputError(event: ExpoSpeechRecognitionErrorEvent): VoiceInputError {
  switch (event.error) {
    case 'aborted':
      return { code: 'cancelled', message: event.message, cause: event };
    case 'busy':
      return { code: 'busy', message: event.message, cause: event };
    case 'no-speech':
    case 'speech-timeout':
      return { code: 'no-speech', message: event.message, cause: event };
    case 'not-allowed':
      return { code: 'not-allowed', message: event.message, cause: event };
    case 'service-not-allowed':
    case 'language-not-supported':
      return { code: 'not-available', message: event.message, cause: event };
    default:
      return { code: 'unknown', message: event.message, cause: event };
  }
}

function readResultText(event: ExpoSpeechRecognitionResultEvent) {
  return event.results[0]?.transcript.trim() ?? '';
}

export class SystemVoiceInputDriver implements VoiceInputDriver {
  private listeners = new Set<VoiceInputEventListener>();
  private isSubscribed = false;
  private subscriptions: EventSubscription[] = [];

  isAvailable() {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  }

  async requestPermissions() {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    return permission.granted;
  }

  start(options: VoiceInputStartOptions) {
    this.ensureSubscribed();

    ExpoSpeechRecognitionModule.start({
      addsPunctuation: true,
      continuous: false,
      interimResults: true,
      lang: options.lang,
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 80,
      },
    });
  }

  stop() {
    ExpoSpeechRecognitionModule.stop();
  }

  cancel() {
    ExpoSpeechRecognitionModule.abort();
  }

  dispose() {
    this.listeners.clear();
    this.removeNativeSubscriptions();
  }

  subscribe(listener: VoiceInputEventListener) {
    this.listeners.add(listener);
    this.ensureSubscribed();

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0) {
        this.removeNativeSubscriptions();
      }
    };
  }

  private emit(event: VoiceInputEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private ensureSubscribed() {
    if (this.isSubscribed) {
      return;
    }

    this.isSubscribed = true;
    this.subscriptions = [
      ExpoSpeechRecognitionModule.addListener('start', () => {
        this.emit({ type: 'start' });
      }),
      ExpoSpeechRecognitionModule.addListener('result', (event) => {
        const text = readResultText(event);

        if (!text) {
          return;
        }

        this.emit({ type: event.isFinal ? 'final' : 'partial', text });
      }),
      ExpoSpeechRecognitionModule.addListener('volumechange', (event) => {
        this.emit({ type: 'volume', value: event.value });
      }),
      ExpoSpeechRecognitionModule.addListener('error', (event) => {
        this.emit({ type: 'error', error: toVoiceInputError(event) });
      }),
      ExpoSpeechRecognitionModule.addListener('end', () => {
        this.emit({ type: 'end' });
      }),
    ];
  }

  private removeNativeSubscriptions() {
    if (!this.isSubscribed) {
      return;
    }

    for (const subscription of this.subscriptions) {
      subscription.remove();
    }

    this.subscriptions = [];
    this.isSubscribed = false;
  }
}
