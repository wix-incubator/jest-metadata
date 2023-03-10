export interface Emitter<Event extends { type: string }, EventType = Event['type'] | '*'> {
  on(type: EventType, listener: (event: Event) => void): this;
  once(type: EventType, listener: (event: Event) => void): this;
  off(type: EventType, listener: (event: Event) => void): this;
  emit(event: Event): void;
}
