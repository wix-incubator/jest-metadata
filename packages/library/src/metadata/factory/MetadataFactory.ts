import type {
  GlobalMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  TestFileMetadata,
  TestEntryMetadata,
  TestInvocationMetadata,
  HookInvocationMetadata,
  TestFnInvocationMetadata,
} from '../containers';
import type { AggregatedIdentifier } from '../ids';
import type { HookType } from '../types';

export interface MetadataFactory {
  createGlobalMetadata(): GlobalMetadata;

  createDescribeBlockMetadata(
    parent: TestFileMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ): DescribeBlockMetadata;

  createHookDefinitionMetadata(
    owner: DescribeBlockMetadata,
    id: AggregatedIdentifier,
    hookType: HookType,
  ): HookDefinitionMetadata;

  createHookInvocationMetadata(
    hookDefinition: HookDefinitionMetadata,
    parent: TestInvocationMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ): HookInvocationMetadata;

  createTestFileMetadata(testFilePath: string, globalMetadata: GlobalMetadata): TestFileMetadata;

  createTestEntryMetadata(
    describeBlock: DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ): TestEntryMetadata;

  createTestFnInvocationMetadata(
    testInvocation: TestInvocationMetadata,
    id: AggregatedIdentifier,
  ): TestFnInvocationMetadata;

  createTestInvocationMetadata(
    testEntry: TestEntryMetadata,
    id: AggregatedIdentifier,
  ): TestInvocationMetadata;
}
