// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import { Context } from './Context';
import { DescribeBlockContext } from './DescribeBlockContext';
import { Data, DataArray } from './Data';

class TestInvocationData {
  readonly beforeHooks: DataArray = [];
  readonly afterHooks: DataArray = [];
  readonly fn: Data = {};
}

export class TestContext implements Context {
  public readonly invocations: TestInvocationData[] = [];

  constructor(
    public readonly parent: DescribeBlockContext,
    public readonly testEntry: Circus.TestEntry,
  ) {}

  get _currentInvocation(): TestInvocationData {
    const last = this.invocations.length - 1;
    const lastInvocation = this.invocations[last];
    if (!lastInvocation) {
      throw new Error('Invalid state: no invocation has been started');
    }

    return lastInvocation;
  }

  get data(): Record<string, unknown> {
    return this._currentInvocation as any;
  }

  get mapping() {
    return this.testEntry;
  }

  startInvocation() {
    this.invocations.push(new TestInvocationData());
    return this;
  }

  assign(data: Record<string, unknown>): void {
    Object.assign(this._currentInvocation, data);
  }

  merge(data: Record<string, unknown>): void {
    Context.merge(this._currentInvocation, data);
  }
}
