import { Emitter } from '../types';

export class SimpleEmitter<Event extends { type: string }, EventType = Event['type'] | '*'>
  implements Emitter<Event, EventType>
{
  private listeners: Map<EventType, ((event: Event) => void)[]> = new Map();

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

  emit(event: Event) {
    const eventType = event.type as EventType;
    const listeners = this.listeners.get(eventType) || [];

    for (const listener of listeners) {
      listener(event);
    }

    const listenersForAll = this.listeners.get('*' as EventType) || [];
    for (const listener of listenersForAll) {
      listener(event);
    }
  }
}
