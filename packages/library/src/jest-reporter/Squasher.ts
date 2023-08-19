import type {
  AggregatedResultMetadata,
  DescribeBlockMetadata,
  Metadata,
  TestEntryMetadata,
  TestInvocationMetadata,
} from '../metadata';

export class Squasher {
  constructor(protected readonly aggregatedMetadata: AggregatedResultMetadata) {}

  describeBlock(describeBlock: DescribeBlockMetadata): Metadata[] {
    return [
      describeBlock,
      ...describeBlock.ancestors(),
      describeBlock.run,
      this.aggregatedMetadata,
    ].reverse();
  }

  testEntry(test: TestEntryMetadata): Metadata[] {
    return test.lastInvocation
      ? this.testInvocation(test.lastInvocation)
      : [...this.describeBlock(test.describeBlock), test];
  }

  testInvocation(invocation: TestInvocationMetadata): Metadata[] {
    return [
      ...this.describeBlock(invocation.entry.describeBlock),
      invocation.entry,
      invocation,
      ...invocation.invocations(),
    ];
  }

  testInvocationAll(invocation: TestInvocationMetadata): Metadata[] {
    return [
      ...this.describeBlock(invocation.entry.describeBlock),
      invocation.entry,
      invocation,
      ...invocation.allInvocations(),
    ];
  }
}
