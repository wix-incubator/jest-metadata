import debug from 'debug';

import { Event } from '../events';

export type EventHandlerCallback = (event: Event) => Promise<void> | void;

const log = debug('jest-metadata:event-queue');

export class EventQueue {
  private readonly handlers: EventHandlerCallback[] = [];
  private _idle: Promise<unknown> = Promise.resolve();
  private _currentEvent?: Event = undefined;

  constructor() {
    this.registerHandler((event) => log(event));
  }

  public get current(): Event | undefined {
    return this._currentEvent;
  }

  public enqueue(event: Event): this {
    this._idle = this._idle.then(() => {
      this._currentEvent = event;
      const batch = this.handlers.map((handler) => handler(event));
      return Promise.all(batch)
        .catch(this.onError)
        .finally(() => {
          this._currentEvent = undefined;
        });
    });

    return this;
  }

  public registerHandler(handler: EventHandlerCallback): this {
    this.handlers.push(handler);
    return this;
  }

  public unregisterAllHandlers(): this {
    this.handlers.splice(0, this.handlers.length);
    return this;
  }

  public flush(): Promise<unknown> {
    return this._idle;
  }

  public onError: (error: Error) => void = (error) => {
    throw error;
  };
}
