import type { Data } from './Data';

export interface Metadata {
  readonly id: string;
  get(): Readonly<Data>;
  get<T>(path?: string | readonly string[], fallbackValue?: T): T;
  set(path: string | readonly string[], value: unknown): this;
  push(path: string | readonly string[], values: unknown[]): this;
  assign(path: undefined | string | readonly string[], value: Data): this;
  merge(path: undefined | string | readonly string[], value: Data): this;
}

export interface InvocationMetadata {
  readonly definition: Metadata;
}
