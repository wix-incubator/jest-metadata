import type { Emitter } from '../../types';
import { ReadonlyEmitterBase } from './ReadonlyEmitterBase';
import { __EMIT, __ENQUEUE, __INVOKE } from './syncEmitterCommons';

/**
 * An event emitter that emits events in the order they are received.
 * If an event is emitted while another event is being emitted, the new event
 * will be queued and emitted after the current event is finished.
 */
export class SerialSyncEmitter<
    Event extends { type: string },
    EventType extends string = Event['type'] | '*',
    EventListener extends (event: Event) => unknown = (event: Event) => unknown,
  >
  extends ReadonlyEmitterBase<Event, EventType, EventListener>
  implements Emitter<Event, EventType>
{
  #queue: Event[] = [];

  emit(nextEvent: Event): void {
    this.#queue.push(Object.freeze(nextEvent));

    if (this.#queue.length > 1) {
      this._log.trace(__ENQUEUE(nextEvent), `enqueue(${nextEvent.type})`);
      return;
    }

    while (this.#queue.length > 0) {
      const event = this.#queue[0];
      const eventType = event.type as EventType;
      const listeners = this._listeners.get(eventType)?.slice();
      const listenersForAll = this._listeners.get('*' as EventType)?.slice();

      this._log.trace.complete(__EMIT(event), event.type, () => {
        if (listeners) {
          for (const listener of listeners) {
            this._log.trace(__INVOKE(listener), 'invoke');
            listener(event);
          }
        }

        if (listenersForAll) {
          for (const listener of listenersForAll) {
            this._log.trace(__INVOKE(listener, '*'), 'invoke');
            listener(event);
          }
        }
      });

      this.#queue.shift();
    }
  }
}
