export type VoiceInputMode = 'system' | 'api';

export type VoiceInputStatus =
  | 'idle'
  | 'requesting-permission'
  | 'listening'
  | 'transcribing'
  | 'error';

export type VoiceInputErrorCode =
  | 'busy'
  | 'cancelled'
  | 'missing-language'
  | 'not-available'
  | 'not-allowed'
  | 'no-speech'
  | 'unknown';

export type VoiceInputError = {
  code: VoiceInputErrorCode;
  message: string;
  cause?: unknown;
};

export type VoiceInputEvent =
  | { type: 'start' }
  | { type: 'partial'; text: string }
  | { type: 'final'; text: string }
  | { type: 'volume'; value: number }
  | { type: 'error'; error: VoiceInputError }
  | { type: 'end' };

export type VoiceInputEventListener = (event: VoiceInputEvent) => void;

export type VoiceInputStartOptions = {
  lang: string;
};

export type VoiceInputDriver = {
  dispose: () => void;
  isAvailable: () => boolean | Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  start: (options: VoiceInputStartOptions) => void | Promise<void>;
  stop: () => void | Promise<void>;
  cancel: () => void | Promise<void>;
  subscribe: (listener: VoiceInputEventListener) => () => void;
};
