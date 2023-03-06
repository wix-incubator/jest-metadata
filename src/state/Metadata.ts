import lodashMerge from 'lodash.merge';

import { Data } from './Data';
import { MetadataContext } from './MetadataContext';
import { ScopedIdentifier } from './ScopedIdentifier';

export class Metadata {
  private readonly _data: Data = {};

  constructor(
    protected readonly context: MetadataContext,
    protected readonly id: ScopedIdentifier,
  ) {
    this.context.metadataRegistry.register(id, this);
  }

  as<T extends Metadata>(constructor: new (...args: any[]) => T): T {
    if (!(this instanceof constructor)) {
      throw new TypeError(`Metadata (${this.id}) is not an instance of ${constructor.name}`);
    }

    return this as T;
  }

  get(): Data;
  get(key: string): unknown;
  get(key?: string): Data | unknown {
    return key ? this._data[key] : this._data;
  }

  set(key: string, value: unknown): this {
    this._data[key] = value;

    this.context.eventQueue.enqueue({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value: { [key]: value },
      deepMerge: false,
    });

    return this;
  }

  assign(value: Data): this {
    Object.assign(this._data, value);

    this.context.eventQueue.enqueue({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value,
      deepMerge: false,
    });

    return this;
  }

  merge(value: Data): this {
    lodashMerge(this._data, value);

    this.context.eventQueue.enqueue({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value,
      deepMerge: true,
    });

    return this;
  }

  async flush(): Promise<void> {
    await this.context.eventQueue.flush();
  }
}
