import type { Emitter, ReadonlyEmitter } from '../../types';
import { SerialEmitter } from './SerialEmitter';

export class AggregatedEmitter<Event extends { type: string }> implements ReadonlyEmitter<Event> {
  readonly #emitters = new WeakSet<Emitter<Event>>();
  readonly #rootEmitter: SerialEmitter<Event>;

  constructor(name: string) {
    this.#rootEmitter = new SerialEmitter<Event>(name);
  }

  add(emitter: Emitter<Event>): this {
    if (!this.#emitters.has(emitter)) {
      this.#emitters.add(emitter);
      emitter.on('*', (event: Event) => /* re-emit */ this.#rootEmitter.emit(event));
    }

    return this;
  }

  on(type: Event['type'] | '*', listener: (event: Event) => unknown): this {
    this.#rootEmitter.on(type, listener);
    return this;
  }

  once(type: Event['type'] | '*', listener: (event: Event) => unknown): this {
    this.#rootEmitter.once(type, listener);
    return this;
  }

  off(type: Event['type'] | '*', listener: (event: Event) => unknown): this {
    this.#rootEmitter.off(type, listener);
    return this;
  }
}
