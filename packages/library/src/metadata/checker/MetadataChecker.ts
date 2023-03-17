import type {
  AggregatedResultMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  RunMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../containers';

import type { Metadata } from '../types';

export interface MetadataChecker {
  isAggregatedResultMetadata(metadata: Metadata | undefined): metadata is AggregatedResultMetadata;

  isRunMetadata(metadata: Metadata | undefined): metadata is RunMetadata;

  isDescribeBlockMetadata(metadata: Metadata | undefined): metadata is DescribeBlockMetadata;

  isHookDefinitionMetadata(metadata: Metadata | undefined): metadata is HookDefinitionMetadata;

  isTestEntryMetadata(metadata: Metadata | undefined): metadata is TestEntryMetadata;

  isHookInvocationMetadata(metadata: Metadata | undefined): metadata is HookInvocationMetadata;

  isTestInvocationMetadata(metadata: Metadata | undefined): metadata is TestInvocationMetadata;

  isTestFnInvocationMetadata(metadata: Metadata | undefined): metadata is TestFnInvocationMetadata;

  asTestInvocationMetadata(metadata: Metadata | undefined): TestInvocationMetadata;

  asDescribeBlockMetadata(metadata: Metadata | undefined): DescribeBlockMetadata;

  asRunMetadata(metadata: Metadata | undefined): RunMetadata;

  asTestEntryMetadata(metadata: Metadata | undefined): TestEntryMetadata;

  asAggregatedResultMetadata(metadata: Metadata | undefined): AggregatedResultMetadata;
}
