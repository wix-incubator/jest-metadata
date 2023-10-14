/* eslint-disable @typescript-eslint/ban-types */
import type { ReadonlyEmitter } from '../../types';
import { iterateSorted } from '../iterateSorted';
import { logger, nologger, optimizeTracing } from '../logger';

//#region Optimized event helpers

const __CATEGORY_LISTENERS = ['listeners'];
const __LISTENERS = optimizeTracing((listener: unknown) => ({
  cat: __CATEGORY_LISTENERS,
  fn: `${listener}`,
}));

//#endregion

const ONCE: unique symbol = Symbol('ONCE');

export abstract class ReadonlyEmitterBase<Event extends { type: string }>
  implements ReadonlyEmitter<Event>
{
  protected readonly _log: typeof logger;
  protected readonly _listeners: Map<Event['type'] | '*', [Function, number][]> = new Map();

  #listenersCounter = 0;

  constructor(name?: string, shouldLog = true) {
    this._log = (shouldLog ? logger : nologger).child({ cat: `emitter`, tid: `emitter-${name}` });
    this._listeners.set('*', []);
  }

  on<E extends Event>(
    type: E['type'] | '*',
    listener: Function & { [ONCE]?: true },
    order?: number,
  ): this {
    if (!listener[ONCE]) {
      this._log.trace(__LISTENERS(listener), `on(${type})`);
    }

    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }

    const listeners = this._listeners.get(type)!;
    listeners.push([listener, order ?? this.#listenersCounter++]);
    listeners.sort((a, b) => getOrder(a) - getOrder(b));

    return this;
  }

  once<E extends Event>(type: E['type'] | '*', listener: Function, order?: number): this {
    this._log.trace(__LISTENERS(listener), `once(${type})`);
    return this.on(type, this.#createOnceListener(type, listener), order);
  }

  off<E extends Event>(
    type: E['type'] | '*',
    listener: Function & { [ONCE]?: true },
    _order?: number,
  ): this {
    if (!listener[ONCE]) {
      this._log.trace(__LISTENERS(listener), `off(${type})`);
    }

    const listeners = this._listeners.get(type) || [];
    const index = listeners.findIndex(([l]) => l === listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    return this;
  }

  protected *_getListeners(type: Event['type']): Iterable<Function> {
    const wildcard: [Function, number][] = this._listeners.get('*') ?? [];
    const named: [Function, number][] = this._listeners.get(type) ?? [];
    for (const [listener] of iterateSorted<[Function, number]>(getOrder, wildcard, named)) {
      yield listener;
    }
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

function getOrder<T>([_a, b]: [T, number]): number {
  return b;
}
