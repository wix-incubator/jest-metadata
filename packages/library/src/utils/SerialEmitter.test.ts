import { SerialEmitter } from './SerialEmitter';

describe('SimpleEmitter', () => {
  it('should emit events', () => {
    const emitter = new SerialEmitter<TestEvent>();
    const listener = jest.fn();
    emitter.on('test', listener);

    emitter.emit({ type: 'test', payload: 42 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ type: 'test', payload: 42 });

    emitter.emit({ type: 'test', payload: 84 });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith({ type: 'test', payload: 84 });
  });

  it('should allow subscribing to events only once', () => {
    const emitter = new SerialEmitter<TestEvent>();
    const listener = jest.fn();
    emitter.once('test', listener);
    emitter.emit({ type: 'test', payload: 42 });
    expect(listener).toHaveBeenCalledWith({ type: 'test', payload: 42 });
    emitter.emit({ type: 'test', payload: 84 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should allow unsubscribing from events', () => {
    const emitter = new SerialEmitter<TestEvent>();
    const listener = jest.fn();
    emitter.on('test', listener);
    emitter.emit({ type: 'test', payload: 42 });
    expect(listener).toHaveBeenCalledTimes(1);
    emitter.off('test', listener);
    emitter.emit({ type: 'test', payload: 84 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should delay emits within emits', () => {
    const emitter = new SerialEmitter<TestEvent>();
    const listener1 = jest.fn(() => emitter.emit({ type: 'test', payload: 84 }));
    const listener2 = jest.fn();
    emitter.once('test', listener1);
    emitter.on('test', listener2);
    emitter.emit({ type: 'test', payload: 42 });
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener2.mock.calls[0][0]).toEqual({ type: 'test', payload: 42 });
    expect(listener2.mock.calls[1][0]).toEqual({ type: 'test', payload: 84 });
  });
});

type TestEvent = {
  type: 'test';
  payload: number;
};
