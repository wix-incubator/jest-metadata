import type { MetadataEvent } from '../metadata';
import { SerialEmitter } from './SerialEmitter';

export type SendMethod<Message> = (message: Message) => Promise<unknown>;

export type MessageQueueEvent<Message> =
  | { type: 'error'; error: Error }
  | { type: 'drain' }
  | { type: 'next'; message: Message };

export class MessageQueue<Message extends MetadataEvent> extends SerialEmitter<
  MessageQueueEvent<Message>
> {
  protected readonly messages: Message[] = [];

  constructor(protected idle: Promise<unknown>, protected readonly send: SendMethod<Message>) {
    super('queue');
  }

  public enqueue(message: Message): this {
    this.messages.push(message);
    this.idle = this.idle.then(this._unshift, this._unshift);
    return this;
  }

  public flush(): Promise<unknown> {
    return this.idle;
  }

  private _unshift = () => {
    const message = this.messages.shift();
    /* istanbul ignore next */
    if (!message) {
      this.emit({ type: 'drain' });
      return;
    }

    this.emit({ type: 'next', message });
    return this.send(message).catch((error) => this.emit({ type: 'error', error }));
  };
}
