/* eslint-disable unicorn/no-null */
import lodashGet from 'lodash.get';
import lodashMerge from 'lodash.merge';
import lodashSet from 'lodash.set';

import { logger, optimizeTracing } from '../../utils';
import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';
import type { Data, Metadata } from '../types';
import type { MetadataContext } from './MetadataContext';

const log = logger.child({ cat: 'metadata', tid: 'metadata' });

const __LOG_METADATA = optimizeTracing((metadata: BaseMetadata, id: AggregatedIdentifier) => {
  log.trace({ id }, metadata.constructor.name);
});

export abstract class BaseMetadata implements Metadata {
  readonly [symbols.id]: AggregatedIdentifier;
  readonly [symbols.context]: MetadataContext;
  readonly [symbols.data]: Data = {};

  constructor(context: MetadataContext, id: AggregatedIdentifier) {
    __LOG_METADATA(this, id);
    this[symbols.context] = context;
    this[symbols.id] = id;
  }

  get id(): string {
    return this[symbols.id].toString();
  }

  get(): Readonly<Data>;
  get(path: string | readonly string[], fallbackValue?: unknown): unknown;
  get(path?: string | readonly string[], fallbackValue?: unknown): Data | unknown {
    return this.#get(path, fallbackValue);
  }

  set(path: string | readonly string[], value: unknown): this {
    this.#assertPath(path, 'set');
    this.#set(path, value);

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

  push(path: string | readonly string[], values: unknown[]): this {
    this.#assertPath(path, 'push to');
    if (!Array.isArray(values)) {
      throw new TypeError(`Cannot push a non-array value to path "${path}". Received: ${values}`);
    }

    const array = lodashGet(this[symbols.data], path, []);
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Cannot push to path "${path}", because it is not an array, but: ${array}`,
      );
    }

    array.push(...values);
    this.#set(path, array);

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

  assign(path: undefined | string | readonly string[], value: object): this {
    const oldValue = this.#get(path, {});
    const source = oldValue && typeof oldValue === 'object' ? oldValue : {};
    Object.assign(source, value);
    if (path != null) {
      this.#set(path, source);
    }

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

  merge(path: undefined | string | readonly string[], value: object): this {
    const oldValue = this.#get(path, {});
    const source = oldValue && typeof oldValue === 'object' ? oldValue : {};
    lodashMerge(source, value);
    if (path != null) {
      this.#set(path, source);
    }

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

  #get(path?: string | readonly string[], fallbackValue?: unknown): Data | unknown {
    return path == null ? this[symbols.data] : lodashGet(this[symbols.data], path, fallbackValue);
  }

  #set(path: string | readonly string[], value: unknown): void {
    lodashSet(this[symbols.data], path, value);
  }

  #assertPath(path: string | readonly string[], operationName: string): void {
    if (path == null) {
      throw new TypeError(`Cannot ${operationName} metadata without a path`);
    }
  }
}