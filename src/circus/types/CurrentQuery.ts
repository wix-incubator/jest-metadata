import {
  AggregatedResultMetadata,
  DescribeBlockMetadata,
  Metadata,
  RunMetadata,
  TestEntryMetadata,
  TestInvocationMetadata,
} from '../../state';

export interface CurrentQuery {
  readonly aggregatedResult: AggregatedResultMetadata | undefined;
  readonly describeBlock: DescribeBlockMetadata | undefined;
  readonly execution: Metadata | undefined;
  readonly hook: Metadata | undefined;
  readonly metadata: Metadata | undefined;
  readonly run: RunMetadata | undefined;
  readonly testEntry: TestEntryMetadata | undefined;
  readonly testFn: Metadata | undefined;
  readonly testInvocation: TestInvocationMetadata | undefined;
}
