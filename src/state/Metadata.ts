import lodashMerge from 'lodash.merge';

import { ContextAPI } from '../circus/types/ContextAPI';
import { SetMetadataEvent } from '../events';
import { Data } from './Data';
import { Ref } from './Ref';

export class Metadata {
  private readonly id: Ref;
  private readonly data: Data = {};

  constructor(protected readonly api: ContextAPI) {
    this.id = api.createRef(this);
  }

  get(): Data;
  get(key: string): unknown;
  get(key?: string): Data | unknown {
    return key ? this.data[key] : this.data;
  }

  set(key: string, value: unknown): this {
    this.data[key] = value;

    this.api.emit<SetMetadataEvent>({
      type: 'set_metadata',
      target: this.id.toString(),
      value: { [key]: value },
      deepMerge: false,
    });

    return this;
  }

  assign(value: Data): this {
    Object.assign(this.data, value);

    this.api.emit<SetMetadataEvent>({
      type: 'set_metadata',
      target: this.id.toString(),
      value,
      deepMerge: false,
    });

    return this;
  }

  merge(value: Data): this {
    lodashMerge(this.data, value);

    this.api.emit<SetMetadataEvent>({
      type: 'set_metadata',
      target: this.id.toString(),
      value,
      deepMerge: true,
    });

    return this;
  }

  flush(): Promise<void> {
    return this.api.flush();
  }
}
