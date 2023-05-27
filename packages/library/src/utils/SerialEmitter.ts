import type { Emitter } from '../types';
import { logger, optimizeForLogger } from './logger';

//#region Optimized event helpers

const CATEGORIES = {
  LISTENERS: ['listeners'],
  ENQUEUE: ['enqueue'],
  EMIT: ['emit'],
  INVOKE: ['invoke'],
};

const __LISTENERS = optimizeForLogger((listener: unknown) => ({
  cat: CATEGORIES.LISTENERS,
  fn: `${listener}`,
}));
const __ENQUEUE = optimizeForLogger((event: unknown) => ({ cat: CATEGORIES.ENQUEUE, event }));
const __EMIT = optimizeForLogger((event: unknown) => ({ cat: CATEGORIES.EMIT, event }));
const __INVOKE = optimizeForLogger((listener: unknown, type?: '*') => ({
  cat: CATEGORIES.INVOKE,
  fn: `${listener}`,
  type,
}));

//#endregion

const ONCE: unique symbol = Symbol('ONCE');

/**
 * An event emitter that emits events in the order they are received.
 * If an event is emitted while another event is being emitted, the new event
 * will be queued and emitted after the current event is finished.
 */
export class SerialEmitter<Event extends { type: string }, EventType = Event['type'] | '*'>
  implements Emitter<Event, EventType>
{
  protected readonly log: typeof logger;
  private listeners: Map<EventType, ((event: Event) => void)[]> = new Map();
  private queue: Event[] = [];

  constructor(name?: string) {
    this.log = logger.child({ cat: `emitter`, tid: `emitter-${name}` });
  }

  on(type: EventType, listener: ((event: Event) => void) & { [ONCE]?: true }): this {
    if (!listener[ONCE]) {
      this.log.trace(__LISTENERS(listener), `on(${type})`);
    }

    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
    return this;
  }

  once(type: EventType, listener: (event: Event) => void): this {
    this.log.trace(__LISTENERS(listener), `once(${type})`);
    return this.on(type, this.#createOnceListener(type, listener));
  }

  off(type: EventType, listener: ((event: Event) => void) & { [ONCE]?: true }): this {
    if (!listener[ONCE]) {
      this.log.trace(__LISTENERS(listener), `off(${type})`);
    }

    const listeners = this.listeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    return this;
  }

  emit(nextEvent: Event) {
    this.queue.push(Object.freeze(nextEvent));

    if (this.queue.length > 1) {
      this.log.trace(__ENQUEUE(nextEvent), `enqueue(${nextEvent.type})`);
      return;
    }

    while (this.queue.length > 0) {
      const event = this.queue[0];
      const eventType = event.type as EventType;
      const listeners = this.listeners.get(eventType)?.slice();
      const listenersForAll = this.listeners.get('*' as EventType)?.slice();

      this.log.trace.complete(__EMIT(event), event.type, () => {
        if (listeners) {
          for (const listener of listeners) {
            this.log.trace(__INVOKE(listener), 'invoke');
            listener(event);
          }
        }

        if (listenersForAll) {
          for (const listener of listenersForAll) {
            this.log.trace(__INVOKE(listener, '*'), 'invoke');
            listener(event);
          }
        }
      });

      this.queue.shift();
    }
  }

  #createOnceListener(type: EventType, listener: (event: Event) => void) {
    const onceListener: ((event: Event) => void) & { [ONCE]?: true } = (event: Event) => {
      this.off(type, onceListener);
      listener(event);
    };

    onceListener[ONCE] = true as const;
    return onceListener;
  }
}
