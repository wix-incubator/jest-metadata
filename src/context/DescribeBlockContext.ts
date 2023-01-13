// eslint-disable-next-line node/no-unpublished-import
import type { Circus } from '@jest/types';

import { Context } from './Context';
import { RunContext } from './RunContext';

export class DescribeBlockContext extends Context {
  constructor(
    public readonly parent: DescribeBlockContext | RunContext,
    public readonly describeBlock: Circus.DescribeBlock,
  ) {
    super();
  }

  get mapping() {
    return this.describeBlock;
  }
}
