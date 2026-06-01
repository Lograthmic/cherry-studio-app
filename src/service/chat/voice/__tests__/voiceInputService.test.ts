import type { VoiceInputDriver, VoiceInputEvent, VoiceInputEventListener } from '../types';
import { VoiceInputService } from '../voiceInputService';

describe('VoiceInputService', () => {
  test('requests permission and starts the driver', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);
    const listener = jest.fn();

    service.subscribe(listener);
    await service.start({ lang: 'zh-CN' });
    driver.emit({ type: 'start' });

    expect(driver.startedWith).toEqual({ lang: 'zh-CN' });
    expect(service.getStatus()).toBe('listening');
    expect(listener).toHaveBeenCalledWith({ type: 'start' });
  });

  test('emits not-available when the driver is unavailable', async () => {
    const driver = new FakeVoiceInputDriver();
    driver.available = false;
    const service = new VoiceInputService(driver);
    const listener = jest.fn();

    service.subscribe(listener);
    await service.start({ lang: 'en-US' });

    expect(driver.startCount).toBe(0);
    expect(service.getStatus()).toBe('error');
    expect(service.getError()).toMatchObject({ code: 'not-available' });
    expect(listener).toHaveBeenCalledWith({
      type: 'error',
      error: expect.objectContaining({ code: 'not-available' }),
    });
  });

  test('emits not-allowed when permission is denied', async () => {
    const driver = new FakeVoiceInputDriver();
    driver.permissionGranted = false;
    const service = new VoiceInputService(driver);
    const listener = jest.fn();

    service.subscribe(listener);
    await service.start({ lang: 'en-US' });

    expect(driver.startCount).toBe(0);
    expect(service.getStatus()).toBe('error');
    expect(service.getError()).toMatchObject({ code: 'not-allowed' });
  });

  test('emits missing-language when no language is provided', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);
    const listener = jest.fn();

    service.subscribe(listener);
    await service.start({ lang: '   ' });

    expect(driver.startCount).toBe(0);
    expect(service.getStatus()).toBe('error');
    expect(service.getError()).toMatchObject({ code: 'missing-language' });
    expect(listener).toHaveBeenCalledWith({
      type: 'error',
      error: expect.objectContaining({ code: 'missing-language' }),
    });
  });

  test('stop enters transcribing until the driver ends', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);

    service.subscribe(jest.fn());
    await service.start({ lang: 'en-US' });
    driver.emit({ type: 'start' });
    await service.stop();

    expect(driver.stopCount).toBe(1);
    expect(service.getStatus()).toBe('transcribing');

    driver.emit({ type: 'end' });

    expect(service.getStatus()).toBe('idle');
  });

  test('cancel calls the driver and returns to idle', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);

    service.subscribe(jest.fn());
    await service.start({ lang: 'en-US' });
    driver.emit({ type: 'start' });
    await service.cancel();

    expect(driver.cancelCount).toBe(1);
    expect(service.getStatus()).toBe('idle');
  });

  test('cancel while requesting permission prevents a late driver start', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);
    let resolvePermission: ((value: boolean) => void) | undefined;

    driver.requestPermissionsHandler = () =>
      new Promise<boolean>((resolve) => {
        resolvePermission = resolve;
      });

    service.subscribe(jest.fn());
    const startPromise = service.start({ lang: 'en-US' });

    expect(service.getStatus()).toBe('requesting-permission');

    await service.cancel();
    resolvePermission?.(true);
    await startPromise;

    expect(driver.cancelCount).toBe(1);
    expect(driver.startCount).toBe(0);
    expect(service.getStatus()).toBe('idle');
  });

  test('forwards driver volume events without changing status', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);
    const listener = jest.fn();

    service.subscribe(listener);
    await service.start({ lang: 'en-US' });
    driver.emit({ type: 'start' });
    driver.emit({ type: 'volume', value: 6 });

    expect(service.getStatus()).toBe('listening');
    expect(listener).toHaveBeenCalledWith({ type: 'volume', value: 6 });
  });

  test('shares one driver subscription across service listeners', () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);
    const firstListener = jest.fn();
    const secondListener = jest.fn();

    service.subscribe(firstListener);
    service.subscribe(secondListener);
    driver.emit({ type: 'start' });

    expect(driver.subscribeCount).toBe(1);
    expect(firstListener).toHaveBeenCalledWith({ type: 'start' });
    expect(secondListener).toHaveBeenCalledWith({ type: 'start' });
  });

  test('keeps the driver subscription until the final service listener unsubscribes', () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);
    const unsubscribeFirst = service.subscribe(jest.fn());
    const unsubscribeSecond = service.subscribe(jest.fn());

    unsubscribeFirst();

    expect(driver.unsubscribeCount).toBe(0);

    unsubscribeSecond();

    expect(driver.unsubscribeCount).toBe(1);
  });

  test('dispose clears listeners and disposes the driver', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);
    const listener = jest.fn();

    service.subscribe(listener);
    await service.dispose();
    driver.emit({ type: 'start' });

    expect(driver.disposeCount).toBe(1);
    expect(listener).not.toHaveBeenCalled();
    expect(service.getStatus()).toBe('idle');
    expect(service.getError()).toBeNull();
  });

  test('dispose cancels active recognition before releasing resources', async () => {
    const driver = new FakeVoiceInputDriver();
    const service = new VoiceInputService(driver);

    service.subscribe(jest.fn());
    await service.start({ lang: 'en-US' });
    driver.emit({ type: 'start' });
    await service.dispose();

    expect(driver.cancelCount).toBe(1);
    expect(driver.disposeCount).toBe(1);
    expect(service.getStatus()).toBe('idle');
  });
});

class FakeVoiceInputDriver implements VoiceInputDriver {
  available = true;
  cancelCount = 0;
  disposeCount = 0;
  listeners = new Set<VoiceInputEventListener>();
  permissionGranted = true;
  requestPermissionsHandler: (() => Promise<boolean>) | undefined;
  startCount = 0;
  startedWith: unknown;
  stopCount = 0;
  subscribeCount = 0;
  unsubscribeCount = 0;

  isAvailable() {
    return this.available;
  }

  async requestPermissions() {
    if (this.requestPermissionsHandler) {
      return this.requestPermissionsHandler();
    }

    return this.permissionGranted;
  }

  start(options: unknown) {
    this.startCount += 1;
    this.startedWith = options;
  }

  stop() {
    this.stopCount += 1;
  }

  cancel() {
    this.cancelCount += 1;
  }

  dispose() {
    this.disposeCount += 1;
    this.listeners.clear();
  }

  subscribe(listener: VoiceInputEventListener) {
    this.subscribeCount += 1;
    this.listeners.add(listener);

    return () => {
      this.unsubscribeCount += 1;
      this.listeners.delete(listener);
    };
  }

  emit(event: VoiceInputEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
