import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { Metadata } from './Metadata';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class RunMetadata extends Metadata {
  rootDescribeBlock: DescribeBlockMetadata | undefined;

  describeBlocks(): IterableIterator<DescribeBlockMetadata> {
    throw new Error('Not implemented');
  }

  testEntries(): IterableIterator<TestEntryMetadata> {
    throw new Error('Not implemented');
  }

  testInvocations(): IterableIterator<TestInvocationMetadata> {
    throw new Error('Not implemented');
  }
}
