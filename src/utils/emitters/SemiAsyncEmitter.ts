import type { ReadonlyAsyncEmitter } from '../../types';
import { SerialAsyncEmitter } from './SerialAsyncEmitter';
import { SerialSyncEmitter } from './SerialSyncEmitter';

export class SemiAsyncEmitter<Event extends { type: string }>
  implements ReadonlyAsyncEmitter<Event>
{
  readonly #asyncEmitter: SerialAsyncEmitter<Event>;
  readonly #syncEmitter: SerialSyncEmitter<Event>;
  readonly #syncEvents: Set<Event['type']>;

  constructor(name: string, syncEvents: Event['type'][]) {
    this.#asyncEmitter = new SerialAsyncEmitter<Event>(name, false);
    this.#syncEmitter = new SerialSyncEmitter<Event>(name, false);
    this.#syncEvents = new Set(syncEvents);
  }

  on<E extends Event>(
    type: E['type'] | '*',
    listener: (event: E) => unknown,
    order?: number,
  ): this {
    return this.#invoke('on', type, listener, order);
  }

  once<E extends Event>(
    type: E['type'] | '*',
    listener: (event: E) => unknown,
    order?: number,
  ): this {
    return this.#invoke('once', type, listener, order);
  }

  off<E extends Event>(type: E['type'] | '*', listener: (event: E) => unknown): this {
    return this.#invoke('off', type, listener);
  }

  emit(event: Event): void | Promise<void> {
    return this.#syncEvents.has(event.type as Event['type'])
      ? this.#syncEmitter.emit(event)
      : this.#asyncEmitter.emit(event);
  }

  #invoke<E extends Event>(
    methodName: 'on' | 'once' | 'off',
    type: E['type'] | '*',
    listener: (event: E) => unknown,
    order?: number,
  ): this {
    const isSync = this.#syncEvents.has(type);

    if (type === '*' || isSync) {
      this.#syncEmitter[methodName](type, listener, order);
    }

    if (type === '*' || !isSync) {
      this.#asyncEmitter[methodName](type, listener as (event: Event) => Promise<void>, order);
    }

    return this;
  }
}
