/* eslint-disable unicorn/no-null */
import lodashGet from 'lodash.get';
import lodashMerge from 'lodash.merge';
import lodashSet from 'lodash.set';

import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';
import type { Data, Metadata } from '../types';
import type { MetadataContext } from './MetadataContext';

export abstract class BaseMetadata implements Metadata {
  readonly [symbols.id]: AggregatedIdentifier;
  readonly [symbols.context]: MetadataContext;
  readonly [symbols.data]: Data = {};

  constructor(context: MetadataContext, id: AggregatedIdentifier) {
    this[symbols.context] = context;
    this[symbols.id] = id;
  }

  get id(): string {
    return this[symbols.id].toString();
  }

  get(): Readonly<Data>;
  get(path: string | string[], fallbackValue?: unknown): unknown;
  get(path?: string | string[], fallbackValue?: unknown): Data | unknown {
    return Object.freeze(
      path ? lodashGet(this[symbols.data], path, fallbackValue) : this[symbols.data],
    );
  }

  set(path: string | string[], value: unknown): this {
    if (path == null) {
      throw new TypeError('Path is required for set operation');
    }

    lodashSet(this[symbols.data], path, value);

    this[symbols.context].emitter.emit({
      type: 'set_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value,
      operation: 'set',
    });

    return this;
  }

  push(path: string | string[], ...values: unknown[]): this {
    if (path == null) {
      throw new TypeError('Path is required for set operation');
    }

    const array = lodashGet(this[symbols.data], path, []);
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Cannot push value to non-array at path "${path}". Existing value: ${array}`,
      );
    }

    array.push(...values);

    this[symbols.context].emitter.emit({
      type: 'set_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value: values,
      operation: 'push',
    });

    return this;
  }

  assign(path: undefined | string | string[], value: Data): this {
    const oldValue = path === undefined ? this.get() : this.get(path, {});
    const source = oldValue && typeof oldValue === 'object' ? oldValue : {};
    Object.assign(source, value);

    this[symbols.context].emitter.emit({
      type: 'set_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
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
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value,
      operation: 'merge',
    });

    return this;
  }
}