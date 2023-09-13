export interface ReadonlyEmitter<Event extends { type: string }, EventType extends string> {
  on(type: EventType, listener: (event: Event) => unknown): this;
  once(type: EventType, listener: (event: Event) => unknown): this;
  off(type: EventType, listener: (event: Event) => unknown): this;
}

export interface ReadonlyAsyncEmitter<
  Event extends { type: string },
  EventType = Event['type'] | '*',
> {
  on(type: EventType, listener: (event: Event) => void | Promise<void>, weight?: number): this;
  once(type: EventType, listener: (event: Event) => void | Promise<void>, weight?: number): this;
  off(type: EventType, listener: (event: Event) => void | Promise<void>): this;
}

export interface Emitter<
  Event extends { type: string },
  EventType extends string = Event['type'] | '*',
> extends ReadonlyEmitter<Event, EventType> {
  emit(event: Event): void;
}

export interface AsyncEmitter<
  Event extends { type: string },
  EventType extends string = Event['type'] | '*',
> extends ReadonlyAsyncEmitter<Event, EventType> {
  emit(event: Event): Promise<void>;
}
