import { describe, it, expect, jest, afterEach } from '@jest/globals';
import { eventEmitter, AppEvents } from '../../src/common/events/event-emitter';
import { env } from '../../src/config/env';

describe('Shadow Mode Event Suppression', () => {
  const originalShadowMode = env.SHADOW_MODE;

  afterEach(() => {
    (env as any).SHADOW_MODE = originalShadowMode;
    eventEmitter.removeAllListeners();
  });

  it('should suppress events when SHADOW_MODE is true', () => {
    (env as any).SHADOW_MODE = true;
    const callback = jest.fn();
    eventEmitter.on(AppEvents.COMMENT_CREATED, callback as any);

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    eventEmitter.emit(AppEvents.COMMENT_CREATED, { id: '123' });

    expect(callback).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[SHADOW MODE] Suppressing event: comment.created'),
      expect.anything()
    );

    logSpy.mockRestore();
  });

  it('should emit events when SHADOW_MODE is false', () => {
    (env as any).SHADOW_MODE = false;
    const callback = jest.fn();
    eventEmitter.on(AppEvents.COMMENT_CREATED, callback as any);

    eventEmitter.emit(AppEvents.COMMENT_CREATED, { id: '123' });

    expect(callback).toHaveBeenCalledWith({ id: '123' });
  });
});
