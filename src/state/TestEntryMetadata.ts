import { Metadata } from './Metadata';
import { MetadataProperties } from './MetadataProperties';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestEntryMetadata extends Metadata {
  // readonly testFn = new TestFnDefinitionMetadata(this.api, this);
  readonly invocations: TestInvocationMetadata[] = [];

  constructor(properties: MetadataProperties, public readonly parent: DescribeBlockMetadata) {
    super(properties);
  }

  get ancestors(): ReadonlyArray<DescribeBlockMetadata> {
    throw new Error('Not implemented');
  }
}
