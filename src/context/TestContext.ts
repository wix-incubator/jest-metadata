// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import { Context } from './Context';
import { DescribeBlockContext } from './DescribeBlockContext';
import { TestInvocationContext } from './TestInvocationContext';

export class TestContext implements Context {
  public readonly invocations: TestInvocationContext[] = [new TestInvocationContext(this, 0)];

  constructor(
    public readonly parent: DescribeBlockContext,
    public readonly testEntry: Circus.TestEntry,
  ) {}

  get data(): Record<string, unknown> {
    return this._currentInvocation.data;
  }

  get mapping() {
    return this.testEntry;
  }

  private get _currentInvocation() {
    // eslint-disable-next-line unicorn/prefer-at
    return this.invocations[this.invocations.length - 1];
  }

  assign(data: Record<string, unknown>): void {
    this._currentInvocation.assign(data);
  }

  merge(data: Record<string, unknown>): void {
    this._currentInvocation.merge(data);
  }
}
