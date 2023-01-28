// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import { Context } from './Context';
import { DescribeBlockContext } from './DescribeBlockContext';

export class RunContext extends Context {
  readonly describeBlocks: DescribeBlockContext[] = [];

  constructor(public readonly testFilePath: string) {
    super();
  }

  openDescribeBlock(circusDescribeBlock: Circus.DescribeBlock): DescribeBlockContext {
    const describeBlock = new DescribeBlockContext(this, circusDescribeBlock);
    this.describeBlocks.push(describeBlock);
    return describeBlock;
  }
}
