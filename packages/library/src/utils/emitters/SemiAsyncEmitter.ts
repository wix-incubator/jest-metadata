import type { ReadonlyAsyncEmitter } from '../../types';
import { SerialAsyncEmitter } from './SerialAsyncEmitter';
import { SerialSyncEmitter } from './SerialSyncEmitter';

export class SemiAsyncEmitter<
  Event extends { type: string },
  EventType extends string = Event['type'] | '*',
> implements ReadonlyAsyncEmitter<Event, EventType>
{
  readonly #asyncEmitter: SerialAsyncEmitter<Event>;
  readonly #syncEmitter: SerialSyncEmitter<Event>;
  readonly #syncEvents: Set<EventType>;

  constructor(name: string, syncEvents: EventType[]) {
    this.#asyncEmitter = new SerialAsyncEmitter<Event>(name, false);
    this.#syncEmitter = new SerialSyncEmitter<Event>(name, false);
    this.#syncEvents = new Set(syncEvents);
  }

  on(type: EventType, listener: (event: Event) => unknown, order?: number): this {
    return this.#invoke('on', type, listener, order);
  }

  once(type: EventType, listener: (event: Event) => unknown, order?: number): this {
    return this.#invoke('once', type, listener, order);
  }

  off(type: EventType, listener: (event: Event) => unknown): this {
    return this.#invoke('off', type, listener);
  }

  emit(event: Event): void | Promise<void> {
    return this.#syncEvents.has(event.type as EventType)
      ? this.#syncEmitter.emit(event)
      : this.#asyncEmitter.emit(event);
  }

  #invoke(
    methodName: 'on' | 'once' | 'off',
    type: EventType,
    listener: (event: Event) => unknown,
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
