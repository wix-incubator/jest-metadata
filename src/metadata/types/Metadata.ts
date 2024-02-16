import type { Data } from './Data';

export interface Metadata {
  readonly id: string;
  get<T extends Data>(): Readonly<T>;
  get<T>(path?: string | readonly string[], fallbackValue?: T): Readonly<T>;
  set(path: string | readonly string[], value: unknown): this;
  push(path: string | readonly string[], values: unknown[]): this;
  unshift(path: string | readonly string[], values: unknown[]): this;
  assign(path: undefined | string | readonly string[], value: Data): this;
  defaults(path: undefined | string | readonly string[], value: Data): this;
  merge(path: undefined | string | readonly string[], value: Data): this;
}

export interface InvocationMetadata {
  readonly definition: Metadata;
}
