import lodashMerge from 'lodash.merge';

import { Data } from './Data';
import { MetadataContext } from './MetadataContext';

export class Metadata {
  private readonly _data: Data = {};

  constructor(protected readonly context: MetadataContext, protected readonly id: string) {}

  get(): Data;
  get(key: string): unknown;
  get(key?: string): Data | unknown {
    return key ? this._data[key] : this._data;
  }

  set(key: string, value: unknown): this {
    this._data[key] = value;

    this.context.emit({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value: { [key]: value },
      deepMerge: false,
    });

    return this;
  }

  assign(value: Data): this {
    Object.assign(this._data, value);

    this.context.emit({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value,
      deepMerge: false,
    });

    return this;
  }

  merge(value: Data): this {
    lodashMerge(this._data, value);

    this.context.emit({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value,
      deepMerge: true,
    });

    return this;
  }

  protected register<T extends Metadata>(metadata: T): T {
    this.context.register(metadata.id, metadata);

    return metadata;
  }
}
