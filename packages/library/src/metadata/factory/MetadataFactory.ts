import type {
  AggregatedResultMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  RunMetadata,
  TestEntryMetadata,
  TestInvocationMetadata,
  HookInvocationMetadata,
  TestFnInvocationMetadata,
} from '../containers';
import type { AggregatedIdentifier } from '../ids';
import type { HookType } from '../types';

export interface MetadataFactory {
  createAggregatedResultMetadata(): AggregatedResultMetadata;

  createDescribeBlockMetadata(
    parent: RunMetadata | DescribeBlockMetadata,
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

  createRunMetadata(testFilePath: string): RunMetadata;

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
