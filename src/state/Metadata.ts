import lodashMerge from 'lodash.merge';

import { Data } from './Data';
import { MetadataProperties } from './MetadataProperties';

export class Metadata {
  private readonly id: string;
  private readonly data: Data = {};
  private readonly emit: MetadataProperties['emit'];

  constructor({ id, emit }: MetadataProperties) {
    this.id = id;
    this.emit = emit;
  }

  get(): Data;
  get(key: string): unknown;
  get(key?: string): Data | unknown {
    return key ? this.data[key] : this.data;
  }

  set(key: string, value: unknown): this {
    this.data[key] = value;

    this.emit({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value: { [key]: value },
      deepMerge: false,
    });

    return this;
  }

  assign(value: Data): this {
    Object.assign(this.data, value);

    this.emit({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value,
      deepMerge: false,
    });

    return this;
  }

  merge(value: Data): this {
    lodashMerge(this.data, value);

    this.emit({
      type: 'set_metadata',
      targetId: this.id.toString(),
      value,
      deepMerge: true,
    });

    return this;
  }
}
