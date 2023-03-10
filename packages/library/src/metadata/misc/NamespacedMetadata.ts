import { Data, Metadata } from '../containers';

const $namespace: unique symbol = Symbol('namespace');
const $metadata: unique symbol = Symbol('metadata');

export class NamespacedMetadata {
  readonly [$namespace]: string;
  readonly [$metadata]: () => Metadata;

  constructor(namespace: string, metadata: () => Metadata) {
    this[$namespace] = namespace;
    this[$metadata] = metadata;
  }

  get(): Data;
  get(path: string | string[], fallbackValue?: unknown): unknown;
  get(path?: string | string[], fallbackValue?: unknown): Data | unknown;
  get(path?: string | string[], fallbackValue?: unknown): unknown {
    const metadata = this[$metadata]();
    const namespace = this[$namespace];

    if (path === undefined) {
      return metadata.get([namespace], {}) as Data;
    } else if (typeof path === 'string') {
      return metadata.get([namespace, ...path.split('.')], fallbackValue);
    } else {
      return metadata.get([namespace, ...path], fallbackValue);
    }
  }

  set(path: string | string[], value: unknown): this {
    const metadata = this[$metadata]();
    const namespace = this[$namespace];

    if (typeof path === 'string') {
      metadata.set([namespace, ...path.split('.')], value);
    } else {
      metadata.set([namespace, ...path], value);
    }

    return this;
  }

  assign(path: string | string[] | undefined, value: Data): this {
    const metadata = this[$metadata]();
    const namespace = this[$namespace];

    if (typeof path === 'string') {
      metadata.assign([namespace, ...path.split('.')], value);
    } else {
      metadata.assign([namespace, ...(path || [])], value);
    }

    return this;
  }

  merge(path: string | string[] | undefined, value: Data): this {
    const metadata = this[$metadata]();
    const namespace = this[$namespace];

    if (typeof path === 'string') {
      metadata.merge([namespace, ...path.split('.')], value);
    } else {
      metadata.merge([namespace, ...(path || [])], value);
    }

    return this;
  }
}
