import lodashMerge from 'lodash.merge';
import { Data } from './Data';

export class Context {
  private readonly data: Data = {};

  get(): Data;
  get(key: string): unknown;
  get(key?: string): Data | unknown {
    return key ? this.data[key] : this.data;
  }

  set(key: string, value: unknown): this {
    this.data[key] = value;
    return this;
  }

  assign(value: Data): this {
    Object.assign(this.data, value);
    return this;
  }

  merge(value: Data): this {
    lodashMerge(this.data, value);
    return this;
  }

  flush(): Promise<void> {

  }
}

