import { Event } from '../events';

export type EventHandler = (event: Event) => Promise<void> | void;

export class EventQueue {
  private readonly handlers: EventHandler[] = [];
  private _idle: Promise<any> = Promise.resolve();
  private _currentEvent?: Event = undefined;

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

  public registerHandler(handler: EventHandler): this {
    this.handlers.push(handler);
    return this;
  }

  public unregisterAllHandlers(): this {
    this.handlers.splice(0, this.handlers.length);
    return this;
  }

  public flush(): Promise<void> {
    return this._idle;
  }

  public onError: (error: Error) => void = (error) => {
    throw error;
  };
}
