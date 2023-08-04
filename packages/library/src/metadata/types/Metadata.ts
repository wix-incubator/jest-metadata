import type { Data } from './Data';

export interface Metadata {
  readonly id: string;
  get(): Readonly<Data>;
  get(path: string | readonly string[], fallbackValue?: unknown): unknown;
  get(path?: string | readonly string[], fallbackValue?: unknown): Data | unknown;
  set(path: string | readonly string[], value: unknown): this;
  push(path: string | readonly string[], values: unknown[]): this;
  assign(path: undefined | string | readonly string[], value: Data): this;
  merge(path: undefined | string | readonly string[], value: Data): this;
}
