import { ContextAPI } from '../circus/types';

import { Metadata } from './Metadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { TestFnDefinitionMetadata } from './TestFnDefinitionMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestEntryMetadata extends Metadata {
  readonly testFn = new TestFnDefinitionMetadata(this.api, this);
  readonly invocations: TestInvocationMetadata[] = [];

  constructor(api: ContextAPI, public readonly parent: DescribeBlockMetadata) {
    super(api);
  }

  get ancestors(): ReadonlyArray<DescribeBlockMetadata> {
    throw new Error('Not implemented');
  }
}
