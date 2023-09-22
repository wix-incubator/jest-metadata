import type {
  GlobalMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  TestFileMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../containers';

import type { Metadata } from '../types';

export interface MetadataChecker {
  isGlobalMetadata(metadata: Metadata | undefined): metadata is GlobalMetadata;

  isTestFileMetadata(metadata: Metadata | undefined): metadata is TestFileMetadata;

  isDescribeBlockMetadata(metadata: Metadata | undefined): metadata is DescribeBlockMetadata;

  isHookDefinitionMetadata(metadata: Metadata | undefined): metadata is HookDefinitionMetadata;

  isTestEntryMetadata(metadata: Metadata | undefined): metadata is TestEntryMetadata;

  isHookInvocationMetadata(metadata: Metadata | undefined): metadata is HookInvocationMetadata;

  isTestInvocationMetadata(metadata: Metadata | undefined): metadata is TestInvocationMetadata;

  isTestFnInvocationMetadata(metadata: Metadata | undefined): metadata is TestFnInvocationMetadata;

  asTestInvocationMetadata(metadata: Metadata | undefined): TestInvocationMetadata | undefined;

  asDescribeBlockMetadata(metadata: Metadata | undefined): DescribeBlockMetadata | undefined;

  asTestFileMetadata(metadata: Metadata | undefined): TestFileMetadata | undefined;

  asTestEntryMetadata(metadata: Metadata | undefined): TestEntryMetadata | undefined;

  asGlobalMetadata(metadata: Metadata | undefined): GlobalMetadata | undefined;
}
