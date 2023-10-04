import type { AsyncEmitter } from '../../types';
import { ReadonlyEmitterBase } from './ReadonlyEmitterBase';
import { __EMIT, __INVOKE } from './syncEmitterCommons';

export class SerialAsyncEmitter<Event extends { type: string }>
  extends ReadonlyEmitterBase<Event>
  implements AsyncEmitter<Event>
{
  #promise = Promise.resolve();

  emit(event: Event): Promise<void> {
    return this.#enqueue(event);
  }

  #enqueue(event: Event) {
    return (this.#promise = this.#promise.then(() => this.#doEmit(event)));
  }

  async #doEmit(event: Event) {
    const eventType = event.type;
    const listeners = [...this._getListeners(eventType)];

    await this._log.trace.complete(__EMIT(event), event.type, async () => {
      if (listeners) {
        for (const listener of listeners) {
          this._log.trace(__INVOKE(listener), 'invoke');
          await listener(event);
        }
      }
    });
  }
}
