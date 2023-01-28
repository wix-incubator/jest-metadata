// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import { Context } from './Context';
import { DataArray } from './Data';
import { RunContext } from './RunContext';
import { TestContext } from './TestContext';

export class DescribeBlockContext extends Context {
  readonly beforeHooks: DataArray = [];
  readonly afterHooks: DataArray = [];
  readonly describeBlocks: DescribeBlockContext[] = [];
  readonly testEntries: TestContext[] = [];

  constructor(
    public readonly parent: DescribeBlockContext | RunContext,
    public readonly describeBlock: Circus.DescribeBlock,
  ) {
    super();
  }

  get mapping() {
    return this.describeBlock;
  }

  openDescribeBlock(circusDescribeBlock: Circus.DescribeBlock): DescribeBlockContext {
    const describeBlock = new DescribeBlockContext(this, circusDescribeBlock);
    this.describeBlocks.push(describeBlock);
    return describeBlock;
  }

  openTestEntry(circusTestEntry: Circus.TestEntry): TestContext {
    const testEntry = new TestContext(this, circusTestEntry);
    this.testEntries.push(testEntry);
    return testEntry;
  }
}
