import lodashMerge from 'lodash.merge';

export class Context {
  readonly parent: Context | undefined;
  readonly data: Record<string, unknown> = {};

  get mapping(): unknown {
    return this.parent?.mapping;
  }

  assign(data: Record<string, unknown>) {
    Object.assign(this.data, data);
  }

  merge(data: Record<string, unknown>) {
    lodashMerge(this.data, data);
  }
}
