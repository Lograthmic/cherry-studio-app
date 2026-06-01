import {
  type VoiceInputDriver,
  type VoiceInputError,
  type VoiceInputEvent,
  type VoiceInputEventListener,
  type VoiceInputMode,
  type VoiceInputStartOptions,
  type VoiceInputStatus,
} from './types';

const notAvailableError: VoiceInputError = {
  code: 'not-available',
  message: 'Speech recognition is not available on this device.',
};

const notAllowedError: VoiceInputError = {
  code: 'not-allowed',
  message: 'Microphone or speech recognition permission was not granted.',
};

const missingLanguageError: VoiceInputError = {
  code: 'missing-language',
  message: 'Voice input language is not configured.',
};

export class VoiceInputService {
  private listeners = new Set<VoiceInputEventListener>();
  private isDriverSubscribed = false;
  private unsubscribeFromDriver: (() => void) | null = null;
  private startRequestId = 0;
  private status: VoiceInputStatus = 'idle';
  private error: VoiceInputError | null = null;

  constructor(private readonly driver: VoiceInputDriver) {}

  getStatus() {
    return this.status;
  }

  getError() {
    return this.error;
  }

  clearError() {
    this.error = null;
  }

  getMode(): VoiceInputMode {
    return 'system';
  }

  subscribe(listener: VoiceInputEventListener) {
    this.listeners.add(listener);
    this.ensureDriverSubscribed();

    return () => {
      this.listeners.delete(listener);

      if (this.listeners.size === 0) {
        this.releaseDriverSubscription();
      }
    };
  }

  async start(options?: VoiceInputStartOptions) {
    if (this.status === 'requesting-permission' || this.status === 'listening') {
      return;
    }

    const lang = options?.lang.trim();

    if (!lang) {
      this.handleError(missingLanguageError);
      return;
    }

    const requestId = this.nextStartRequestId();
    this.setStatus('requesting-permission');

    try {
      if (!(await this.driver.isAvailable())) {
        if (!this.isCurrentStartRequest(requestId)) {
          return;
        }

        this.handleError(notAvailableError);
        return;
      }

      const hasPermission = await this.driver.requestPermissions();

      if (!this.isCurrentStartRequest(requestId)) {
        return;
      }

      if (!hasPermission) {
        this.handleError(notAllowedError);
        return;
      }

      this.error = null;
      await this.driver.start({
        lang,
      });
    } catch (error) {
      if (!this.isCurrentStartRequest(requestId)) {
        return;
      }

      this.handleError({
        code: 'unknown',
        message: 'Failed to start voice input.',
        cause: error,
      });
    }
  }

  async stop() {
    if (this.status !== 'listening') {
      return;
    }

    this.setStatus('transcribing');
    await this.driver.stop();
  }

  async cancel() {
    if (this.status === 'idle') {
      return;
    }

    this.invalidateStartRequest();
    await this.driver.cancel();
    this.setStatus('idle');
  }

  async dispose() {
    const shouldCancel =
      this.status === 'requesting-permission' ||
      this.status === 'listening' ||
      this.status === 'transcribing';

    this.listeners.clear();

    try {
      if (shouldCancel) {
        await this.cancel();
      }
    } finally {
      this.releaseDriverSubscription();
      this.driver.dispose();
      this.error = null;
      this.setStatus('idle');
    }
  }

  private ensureDriverSubscribed() {
    if (this.isDriverSubscribed) {
      return;
    }

    this.isDriverSubscribed = true;
    this.unsubscribeFromDriver = this.driver.subscribe((event) => {
      this.handleDriverEvent(event);
    });
  }

  private releaseDriverSubscription() {
    if (!this.isDriverSubscribed) {
      return;
    }

    this.unsubscribeFromDriver?.();
    this.unsubscribeFromDriver = null;
    this.isDriverSubscribed = false;
  }

  private handleDriverEvent(event: VoiceInputEvent) {
    switch (event.type) {
      case 'start':
        this.error = null;
        this.setStatus('listening');
        this.emit(event);
        break;
      case 'partial':
      case 'final':
      case 'volume':
        this.emit(event);
        break;
      case 'error':
        if (event.error.code === 'cancelled') {
          this.setStatus('idle');
          this.emit({ type: 'end' });
          return;
        }

        this.handleError(event.error);
        break;
      case 'end':
        this.setStatus('idle');
        this.emit(event);
        break;
    }
  }

  private handleError(error: VoiceInputError) {
    this.error = error;
    this.setStatus('error');
    this.emit({ type: 'error', error });
  }

  private setStatus(status: VoiceInputStatus) {
    this.status = status;
  }

  private nextStartRequestId() {
    this.startRequestId += 1;
    return this.startRequestId;
  }

  private invalidateStartRequest() {
    this.startRequestId += 1;
  }

  private isCurrentStartRequest(requestId: number) {
    return requestId === this.startRequestId && this.status === 'requesting-permission';
  }

  private emit(event: VoiceInputEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
