import { AggregatedResultMetadata } from './AggregatedResultMetadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { Metadata } from './Metadata';
import { RunMetadata } from './RunMetadata';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class Query {
  aggregatedResult?: AggregatedResultMetadata;
  run?: RunMetadata;
  describeBlock?: DescribeBlockMetadata;
  execution?: Metadata;
  hook?: Metadata;
  metadata?: Metadata;
  testEntry?: TestEntryMetadata;
  testFn?: Metadata;
  testInvocation?: TestInvocationMetadata;
}
