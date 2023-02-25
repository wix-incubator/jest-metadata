import { Metadata } from './Metadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestEntryMetadata extends Metadata {
  // readonly testFn = new TestFnDefinitionMetadata(this.api, this);
  readonly invocations: TestInvocationMetadata[] = [];

  get ancestors(): ReadonlyArray<DescribeBlockMetadata> {
    throw new Error('Not implemented');
  }
}
