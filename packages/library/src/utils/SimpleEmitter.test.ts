import { SimpleEmitter } from './SimpleEmitter';

describe('SimpleEmitter', () => {
  it('should emit events', () => {
    const emitter = new SimpleEmitter<TestEvent>();
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
    const emitter = new SimpleEmitter<TestEvent>();
    const listener = jest.fn();
    emitter.once('test', listener);
    emitter.emit({ type: 'test', payload: 42 });
    expect(listener).toHaveBeenCalledWith({ type: 'test', payload: 42 });
    emitter.emit({ type: 'test', payload: 84 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should allow unsubscribing from events', () => {
    const emitter = new SimpleEmitter<TestEvent>();
    const listener = jest.fn();
    emitter.on('test', listener);
    emitter.emit({ type: 'test', payload: 42 });
    expect(listener).toHaveBeenCalledTimes(1);
    emitter.off('test', listener);
    emitter.emit({ type: 'test', payload: 84 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

type TestEvent = {
  type: 'test';
  payload: number;
};
