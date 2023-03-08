import lodashMerge from 'lodash.merge';

import { MetadataContext } from './MetadataContext';
import { AggregatedIdentifier } from './utils/AggregatedIdentifier';
import * as symbols from './symbols';

export type Data = Record<string, unknown>;

export class Metadata {
  readonly [symbols.id]: AggregatedIdentifier;
  readonly [symbols.context]: MetadataContext;
  readonly [symbols.data]: Data = {};

  constructor(context: MetadataContext, id: AggregatedIdentifier) {
    this[symbols.context] = context;
    this[symbols.id] = id;
    context.metadataRegistry.register(id, this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as<T extends Metadata>(constructor: new (...args: any[]) => T): T {
    if (!(this instanceof constructor)) {
      throw new TypeError(
        `Metadata (${this[symbols.id]}) is not an instance of ${constructor.name}`,
      );
    }

    return this as T;
  }

  get(): Data;
  get(key: string): unknown;
  get(key?: string): Data | unknown {
    return key ? this[symbols.data][key] : this[symbols.data];
  }

  set(key: string, value: unknown): this {
    this[symbols.data][key] = value;

    this[symbols.context].eventQueue.enqueue({
      type: 'set_metadata',
      targetId: this[symbols.id].toString(),
      value: { [key]: value },
      deepMerge: false,
    });

    return this;
  }

  assign(value: Data): this {
    Object.assign(this[symbols.data], value);

    this[symbols.context].eventQueue.enqueue({
      type: 'set_metadata',
      targetId: this[symbols.id].toString(),
      value,
      deepMerge: false,
    });

    return this;
  }

  merge(value: Data): this {
    lodashMerge(this[symbols.data], value);

    this[symbols.context].eventQueue.enqueue({
      type: 'set_metadata',
      targetId: this[symbols.id].toString(),
      value,
      deepMerge: true,
    });

    return this;
  }

  async flush(): Promise<void> {
    await this[symbols.context].eventQueue.flush();
  }
}
