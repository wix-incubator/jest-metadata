import type { ReadonlyEmitter } from '../../types';
import { iterateSorted } from '../iterateSorted';
import { logger, nologger, optimizeForLogger } from '../logger';

//#region Optimized event helpers

const __CATEGORY_LISTENERS = ['listeners'];
const __LISTENERS = optimizeForLogger((listener: unknown) => ({
  cat: __CATEGORY_LISTENERS,
  fn: `${listener}`,
}));

//#endregion

const ONCE: unique symbol = Symbol('ONCE');

export abstract class ReadonlyEmitterBase<
  Event extends { type: string },
  EventType extends string,
  EventListener extends (event: Event) => unknown,
> implements ReadonlyEmitter<Event, EventType | '*'>
{
  protected readonly _log: typeof logger;
  protected readonly _listeners: Map<EventType | '*', EventListener[]> = new Map();

  #listenersCounter = 0;
  readonly #listenersOrder = new WeakMap<EventListener, number>();

  constructor(name?: string, shouldLog = true) {
    this._log = (shouldLog ? logger : nologger).child({ cat: `emitter`, tid: `emitter-${name}` });
    this._listeners.set('*', []);
  }

  on(type: EventType, listener: EventListener & { [ONCE]?: true }): this {
    if (!listener[ONCE]) {
      this._log.trace(__LISTENERS(listener), `on(${type})`);
    }

    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }
    this._listeners.get(type)!.push(this.#rememberListener(listener));
    return this;
  }

  once(type: EventType, listener: EventListener): this {
    this._log.trace(__LISTENERS(listener), `once(${type})`);
    return this.on(type, this.#createOnceListener(type, listener));
  }

  off(type: EventType, listener: EventListener & { [ONCE]?: true }): this {
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

  protected _getListeners(type: EventType): Iterable<EventListener> {
    const wildcard = this._listeners.get('*')!;
    const named = this._listeners.get(type);
    return named ? iterateSorted(this.#getListenerOrder, wildcard, named) : wildcard;
  }

  #rememberListener<T extends EventListener>(listener: T): T {
    this.#listenersOrder.set(listener, this.#listenersCounter++);
    return listener;
  }

  #createOnceListener(type: EventType, listener: EventListener) {
    const onceListener = ((event: Event) => {
      this.off(type, onceListener);
      listener(event);
    }) as EventListener & { [ONCE]?: true };

    onceListener[ONCE] = true as const;
    return onceListener;
  }

  #getListenerOrder = (listener: EventListener): number =>
    this.#listenersOrder.get(listener) ?? Number.NaN;
}
