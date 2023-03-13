import { SerialEmitter } from './SerialEmitter';

export type SendMethod<Message> = (message: Message) => Promise<unknown>;

export type MessageQueueEvent<Message> =
  | { type: 'error'; error: Error }
  | { type: 'drain' }
  | { type: 'next'; message: Message };

export class MessageQueue<Message> extends SerialEmitter<MessageQueueEvent<Message>> {
  private _idle: Promise<unknown> = Promise.resolve();
  private _queue: Message[] = [];
  constructor(protected readonly send: SendMethod<Message>) {
    super();
  }

  public enqueue(message: Message): this {
    this._queue.push(message);
    this._idle = this._idle.then(this._unshift, this._unshift);
    return this;
  }

  public flush(): Promise<unknown> {
    return this._idle;
  }

  private _unshift = () => {
    const message = this._queue.shift();
    /* istanbul ignore next */
    if (!message) {
      this.emit({ type: 'drain' });
      return;
    }

    this.emit({ type: 'next', message });
    return this.send(message).catch((error) => this.emit({ type: 'error', error }));
  };
}
