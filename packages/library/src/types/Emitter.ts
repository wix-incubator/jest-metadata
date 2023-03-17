export interface ReadonlyEmitter<Event extends { type: string }, EventType = Event['type'] | '*'> {
  on(type: EventType, listener: (event: Event) => void): this;
  once(type: EventType, listener: (event: Event) => void): this;
  off(type: EventType, listener: (event: Event) => void): this;
}

export interface Emitter<Event extends { type: string }, EventType = Event['type'] | '*'>
  extends ReadonlyEmitter<Event, EventType> {
  emit(event: Event): void;
}
