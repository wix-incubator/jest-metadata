import type { Emitter } from '../types';

/**
 * An event emitter that emits events in the order they are received.
 * If an event is emitted while another event is being emitted, the new event
 * will be queued and emitted after the current event is finished.
 */
export class SerialEmitter<Event extends { type: string }, EventType = Event['type'] | '*'>
  implements Emitter<Event, EventType>
{
  private listeners: Map<EventType, ((event: Event) => void)[]> = new Map();
  private queue: Event[] = [];

  on(type: EventType, listener: (event: Event) => void): this {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
    return this;
  }

  once(type: EventType, listener: (event: Event) => void): this {
    const onceListener = (event: Event) => {
      this.off(type, onceListener);
      listener(event);
    };
    return this.on(type, onceListener);
  }

  off(type: EventType, listener: (event: Event) => void): this {
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
      return;
    }

    while (this.queue.length > 0) {
      const event = this.queue[0];
      const eventType = event.type as EventType;
      const listeners = this.listeners.get(eventType)?.slice();

      if (listeners) {
        for (const listener of listeners) {
          listener(event);
        }
      }

      const listenersForAll = this.listeners.get('*' as EventType)?.slice();
      if (listenersForAll) {
        for (const listener of listenersForAll) {
          listener(event);
        }
      }

      this.queue.shift();
    }
  }
}
