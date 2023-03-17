import type { Data } from './Data';

export interface Metadata {
  readonly id: string;
  get(): Readonly<Data>;
  get(path: string | string[], fallbackValue?: unknown): unknown;
  get(path?: string | string[], fallbackValue?: unknown): Data | unknown;
  set(path: string | string[], value: unknown): this;
  push(path: string | string[], ...values: unknown[]): this;
  assign(path: undefined | string | string[], value: Data): this;
  merge(path: undefined | string | string[], value: Data): this;
}
