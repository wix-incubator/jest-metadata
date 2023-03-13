import lodashGet from 'lodash.get';
import lodashSet from 'lodash.set';
import lodashMerge from 'lodash.merge';

import type { AggregatedIdentifier, MetadataContext } from '../misc';
import * as symbols from '../symbols';

export type Data = Record<string, unknown>;

export class Metadata {
  readonly [symbols.id]: AggregatedIdentifier;
  readonly [symbols.context]: MetadataContext;
  readonly [symbols.data]: Data = {};

  constructor(context: MetadataContext, id: AggregatedIdentifier) {
    this[symbols.context] = context;
    this[symbols.id] = id;
  }

  get(): Data;
  get(path: string | string[], fallbackValue?: unknown): unknown;
  get(path?: string | string[], fallbackValue?: unknown): Data | unknown {
    return path ? lodashGet(this[symbols.data], path, fallbackValue) : this[symbols.data];
  }

  set(path: string | string[], value: unknown): this {
    lodashSet(this[symbols.data], path, value);

    this[symbols.context].emitter.emit({
      type: 'set_metadata',
      targetId: this[symbols.id].toString(),
      path,
      value,
      operation: 'set',
    });

    return this;
  }

  assign(path: undefined | string | string[], value: Data): this {
    const oldValue = path === undefined ? this.get() : this.get(path, {});
    const source = oldValue && typeof oldValue === 'object' ? oldValue : {};
    Object.assign(source, value);

    this[symbols.context].emitter.emit({
      type: 'set_metadata',
      targetId: this[symbols.id].toString(),
      path,
      value,
      operation: 'assign',
    });

    return this;
  }

  merge(path: undefined | string | string[], value: Data): this {
    const oldValue = path === undefined ? this.get() : this.get(path, {});
    const source = oldValue && typeof oldValue === 'object' ? oldValue : {};
    lodashMerge(source, value);

    this[symbols.context].emitter.emit({
      type: 'set_metadata',
      targetId: this[symbols.id].toString(),
      path,
      value,
      operation: 'merge',
    });

    return this;
  }
}
