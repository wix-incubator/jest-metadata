/* eslint-disable unicorn/no-null */
import lodashMerge from 'lodash.merge';

import { get as lodashGet, set as lodashSet, diagnostics, optimizeTracing } from '../../utils';
import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';
import type { Data, Metadata } from '../types';
import type { MetadataContext } from './MetadataContext';

const log = diagnostics.child({ cat: 'metadata', tid: 'jest-metadata' });

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

  set(path: string | readonly string[], $value: unknown): this {
    const value = this.#sanitize($value);
    this.#assertPath(path, 'set');
    this.#set(path, value);

    this[symbols.context].emitter.emit({
      type: 'write_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value,
      operation: 'set',
    });

    return this;
  }

  push(path: string | readonly string[], $values: unknown[]): this {
    return this.#concat('push', path, this.#sanitize($values));
  }

  unshift(path: string | readonly string[], $values: unknown[]): this {
    return this.#concat('unshift', path, this.#sanitize($values));
  }

  assign(path: undefined | string | readonly string[], $value: object): this {
    const oldValue = this.#get(path, {});
    const source = oldValue && typeof oldValue === 'object' ? oldValue : {};
    const value = this.#sanitize($value);
    Object.assign(source, value);
    if (path != null) {
      this.#set(path, source);
    }

    this[symbols.context].emitter.emit({
      type: 'write_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value,
      operation: 'assign',
    });

    return this;
  }

  defaults(path: undefined | string | readonly string[], $value: object): this {
    const oldValue = this.#get(path, {});
    const value = this.#sanitize($value);
    const source = (oldValue && typeof oldValue === 'object' ? oldValue : {}) as Data;
    for (const key of Object.keys(value)) {
      if (source[key] === undefined) {
        source[key] = ($value as Data)[key];
      }
    }
    if (path != null) {
      this.#set(path, source);
    }

    this[symbols.context].emitter.emit({
      type: 'write_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value,
      operation: 'defaults',
    });

    return this;
  }

  merge(path: undefined | string | readonly string[], $value: object): this {
    const oldValue = this.#get(path, {});
    const value = this.#sanitize($value);
    const source = oldValue && typeof oldValue === 'object' ? oldValue : {};
    lodashMerge(source, value);
    if (path != null) {
      this.#set(path, source);
    }

    this[symbols.context].emitter.emit({
      type: 'write_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value,
      operation: 'merge',
    });

    return this;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      data: this[symbols.data],
    };
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

  #concat(operation: 'push' | 'unshift', path: string | readonly string[], values: unknown[]) {
    this.#assertPath(path, `${operation} to`);
    if (!Array.isArray(values)) {
      throw new TypeError(
        `Cannot ${operation} a non-array value to path "${path}". Received: ${values}`,
      );
    }

    const array = lodashGet(this[symbols.data], path, [] as unknown[]);
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Cannot ${operation} to path "${path}", because it is not an array, but: ${array}`,
      );
    }

    array[operation](...values);
    this.#set(path, array);

    this[symbols.context].emitter.emit({
      type: 'write_metadata',
      testFilePath: this[symbols.id].testFilePath,
      targetId: this[symbols.id].identifier,
      path,
      value: values,
      operation,
    });

    return this;
  }

  #sanitize<T>(value: T): T {
    try {
      return JSON.parse(JSON.stringify(value)) as T;
    } catch {
      throw new TypeError(`Given value cannot be serialized to JSON: ${value}`);
    }
  }
}
