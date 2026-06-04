import type { ExpoSpeechRecognitionNativeEventMap } from 'expo-speech-recognition';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { SystemVoiceInputDriver } from '../SystemVoiceInputDriver';

type NativeEventName = keyof ExpoSpeechRecognitionNativeEventMap;
type NativeListener = (event: unknown) => void;

const mockNativeListeners = new Map<NativeEventName, Set<NativeListener>>();
const mockNativeSubscriptions: Array<{ remove: jest.Mock }> = [];

jest.mock('expo-speech-recognition', () => {
  const addListener = jest.fn((eventName: NativeEventName, listener: NativeListener) => {
    if (!mockNativeListeners.has(eventName)) {
      mockNativeListeners.set(eventName, new Set());
    }

    mockNativeListeners.get(eventName)?.add(listener);

    const subscription = {
      remove: jest.fn(() => {
        mockNativeListeners.get(eventName)?.delete(listener);
      }),
    };

    mockNativeSubscriptions.push(subscription);

    return subscription;
  });

  return {
    ExpoSpeechRecognitionModule: {
      abort: jest.fn(),
      addListener,
      isRecognitionAvailable: jest.fn(() => true),
      requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
      start: jest.fn(),
      stop: jest.fn(),
    },
  };
});

describe('SystemVoiceInputDriver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeListeners.clear();
    mockNativeSubscriptions.length = 0;
  });

  test('registers native listeners once across multiple subscribers', () => {
    const driver = new SystemVoiceInputDriver();

    driver.subscribe(jest.fn());
    driver.subscribe(jest.fn());

    expect(ExpoSpeechRecognitionModule.addListener).toHaveBeenCalledTimes(5);
  });

  test('forwards native events to subscribers', () => {
    const driver = new SystemVoiceInputDriver();
    const listener = jest.fn();

    driver.subscribe(listener);
    emitNativeEvent('start', null);
    emitNativeEvent('result', {
      isFinal: false,
      results: [{ transcript: ' hello ', confidence: 1, segments: [] }],
    });
    emitNativeEvent('volumechange', { value: 4 });

    expect(listener).toHaveBeenCalledWith({ type: 'start' });
    expect(listener).toHaveBeenCalledWith({ type: 'partial', text: 'hello' });
    expect(listener).toHaveBeenCalledWith({ type: 'volume', value: 4 });
  });

  test('removes native listeners after the final subscriber unsubscribes', () => {
    const driver = new SystemVoiceInputDriver();
    const unsubscribeFirst = driver.subscribe(jest.fn());
    const unsubscribeSecond = driver.subscribe(jest.fn());

    unsubscribeFirst();

    expect(
      mockNativeSubscriptions.every((subscription) => subscription.remove.mock.calls.length === 0),
    ).toBe(true);

    unsubscribeSecond();

    expect(
      mockNativeSubscriptions.every((subscription) => subscription.remove.mock.calls.length === 1),
    ).toBe(true);
  });

  test('dispose removes native listeners and is idempotent', () => {
    const driver = new SystemVoiceInputDriver();

    driver.subscribe(jest.fn());
    driver.dispose();
    driver.dispose();

    expect(
      mockNativeSubscriptions.every((subscription) => subscription.remove.mock.calls.length === 1),
    ).toBe(true);
  });

  test('can subscribe again after all native listeners are removed', () => {
    const driver = new SystemVoiceInputDriver();
    const unsubscribe = driver.subscribe(jest.fn());

    unsubscribe();
    driver.subscribe(jest.fn());

    expect(ExpoSpeechRecognitionModule.addListener).toHaveBeenCalledTimes(10);
  });
});

function emitNativeEvent(eventName: NativeEventName, event: unknown) {
  for (const listener of mockNativeListeners.get(eventName) ?? []) {
    listener(event);
  }
}
