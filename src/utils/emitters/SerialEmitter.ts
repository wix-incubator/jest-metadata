/* eslint-disable @typescript-eslint/ban-types */
import type { Emitter } from '../../types';

import { diagnostics, nologger, optimizeTracing } from '../logger';

//#region Optimized event helpers

const CATEGORIES = {
  ENQUEUE: ['enqueue'],
  EMIT: ['emit'],
  INVOKE: ['invoke'],
  LISTENERS: ['listeners'],
};

const __EMIT = optimizeTracing((event: unknown) => ({ cat: CATEGORIES.EMIT, event }));
const __ENQUEUE = optimizeTracing((event: unknown) => ({
  cat: CATEGORIES.ENQUEUE,
  event,
}));
const __INVOKE = optimizeTracing((listener: unknown, type?: '*') => ({
  cat: CATEGORIES.INVOKE,
  fn: `${listener}`,
  type,
}));
const __LISTENERS = optimizeTracing((listener: unknown) => ({
  cat: CATEGORIES.LISTENERS,
  fn: `${listener}`,
}));

//#endregion

const ONCE: unique symbol = Symbol('ONCE');

/**
 * An event emitter that emits events in the order they are received.
 * If an event is emitted while another event is being emitted, the new event
 * will be queued and emitted after the current event is finished.
 */
export class SerialEmitter<Event extends { type: string }> implements Emitter<Event> {
  protected readonly _log: typeof diagnostics;
  protected readonly _listeners: Map<Event['type'] | '*', Function[]> = new Map();

  #queue: Event[] = [];

  constructor(name?: string, shouldLog = true) {
    this._log = (shouldLog ? diagnostics : nologger).child({
      cat: [`emitter`, `emitter-${name}`],
      tid: `jest-metadata-emitter-${name}`,
    });
    this._listeners.set('*', []);
  }

  on<E extends Event>(type: E['type'] | '*', listener: Function & { [ONCE]?: true }): this {
    if (!listener[ONCE]) {
      this._log.trace(__LISTENERS(listener), `on(${type})`);
    }

    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }

    const listeners = this._listeners.get(type)!;
    listeners.push(listener);

    return this;
  }

  once<E extends Event>(type: E['type'] | '*', listener: Function): this {
    this._log.trace(__LISTENERS(listener), `once(${type})`);
    return this.on(type, this.#createOnceListener(type, listener));
  }

  off<E extends Event>(type: E['type'] | '*', listener: Function & { [ONCE]?: true }): this {
    if (!listener[ONCE]) {
      this._log.trace(__LISTENERS(listener), `off(${type})`);
    }

    const listeners = this._listeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    return this;
  }

  emit(nextEvent: Event): void {
    this.#queue.push(Object.freeze(nextEvent));

    if (this.#queue.length > 1) {
      this._log.trace(__ENQUEUE(nextEvent), `enqueue(${nextEvent.type})`);
      return;
    }

    while (this.#queue.length > 0) {
      const event = this.#queue[0];
      const eventType = event.type;
      const listeners = this._getListeners(eventType);

      this._log.trace.complete(__EMIT(event), event.type, () => {
        if (listeners) {
          for (const listener of listeners) {
            this._log.trace(__INVOKE(listener), 'invoke');
            listener(event);
          }
        }
      });

      this.#queue.shift();
    }
  }

  protected _getListeners(type: Event['type']): Function[] {
    const wildcard: Function[] = this._listeners.get('*') ?? [];
    const named: Function[] = this._listeners.get(type) ?? [];
    return [...wildcard, ...named];
  }

  #createOnceListener(type: Event['type'], listener: Function) {
    const onceListener = ((event: Event) => {
      this.off(type, onceListener);
      listener(event);
    }) as Function & { [ONCE]?: true };

    onceListener[ONCE] = true as const;
    return onceListener;
  }
}
