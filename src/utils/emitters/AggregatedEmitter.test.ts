import { AggregatedEmitter } from './AggregatedEmitter';
import { SerialSyncEmitter } from './SerialSyncEmitter';

describe('AggregatedEmitter', () => {
  let emitter: AggregatedEmitter<{ type: string }>;

  beforeEach(() => {
    emitter = new AggregatedEmitter('test');
  });

  test('should re-emit events of added #emitters', () => {
    const dummy1 = new SerialSyncEmitter('dummy1');
    const dummy2 = new SerialSyncEmitter('dummy2');
    const listener = jest.fn();
    const event1 = { type: 'test', id: 1 };
    const event2 = { type: 'test', id: 2 };

    emitter.add(dummy1).add(dummy2).on('test', listener);

    dummy1.emit(event1);
    dummy2.emit(event2);

    expect(listener).toHaveBeenCalledWith(event1);
    expect(listener).toHaveBeenCalledWith(event2);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('should allow subscribing to events only once', () => {
    const dummy1 = new SerialSyncEmitter('dummy1');
    const dummy2 = new SerialSyncEmitter('dummy2');
    const listener = jest.fn();
    const event1 = { type: 'test', id: 1 };
    const event2 = { type: 'test', id: 2 };

    emitter.add(dummy1).add(dummy2).once('test', listener);

    dummy1.emit(event1);
    dummy2.emit(event2);
    expect(listener).toHaveBeenCalledWith(event1);
    expect(listener).not.toHaveBeenCalledWith(event2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('should allow unsubscribing from events', () => {
    const dummy = new SerialSyncEmitter('dummy1');
    const listener = jest.fn();
    const event = { type: 'test', id: 1 };

    emitter.add(dummy).on('test', listener).off('test', listener);

    dummy.emit(event);
    expect(listener).not.toHaveBeenCalled();
  });
});
