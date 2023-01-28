// eslint-disable-next-line node/no-unpublished-import
import type { Test, TestResult, TestCaseResult } from '@jest/reporters';

export type Data = Record<string, unknown>;

export interface Metadata {
  readonly type: string;
  get(): Data;
  get(key: string): unknown;
}

export interface AggregatedResultMetadata extends Metadata {
  readonly type: 'aggregatedResult';
  testResults: Readonly<Record<string, TestResultMetadata>>;
}

export interface TestResultMetadata extends Metadata {
  readonly type: 'run';
  rootDescribeBlock?: DescribeBlockMetadata;
  describeBlocks(): Iterable<TestEntryMetadata>;
  testEntries(): Iterable<TestEntryMetadata>;
  testInvocations(): Iterable<TestInvocationMetadata>;
}

export interface DescribeBlockMetadata extends MetadataWithHooks {
  readonly type: 'describe';
  children: ReadonlyArray<DescribeBlockMetadata | TestEntryMetadata>;
  testEntries: ReadonlyArray<TestEntryMetadata>;
  testInvocations: ReadonlyArray<TestInvocationMetadata>;

  allTestEntries(): Iterable<TestEntryMetadata>;
  allTestInvocations(): Iterable<TestInvocationMetadata>;
}

export interface TestEntryMetadata extends Metadata {
  readonly type: 'test';
  invocations: ReadonlyArray<TestInvocationMetadata>;
  ancestors: ReadonlyArray<DescribeBlockMetadata>;
}

export interface TestInvocationMetadata extends MetadataWithHooks {
  readonly type: 'testInvocation';
  testFn: Data;
}

export interface MetadataWithHooks extends Metadata {
  beforeHooks: ReadonlyArray<Metadata>;
  afterHooks: ReadonlyArray<Metadata>;
}

export interface QueryMetadata {
  filePath(value: string): TestResultMetadata | undefined;
  test(item: Test): TestResultMetadata | undefined;
  testCaseResult(item: TestCaseResult): TestEntryMetadata | undefined;
  testResult(item: TestResult): TestResultMetadata | undefined;
  aggregatedResult(): AggregatedResultMetadata | undefined;
}

export interface ReporterExport {
  readonly query: QueryMetadata;
}
