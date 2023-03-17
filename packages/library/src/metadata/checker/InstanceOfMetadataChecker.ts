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
import type { MetadataChecker } from './MetadataChecker';

type Constructor<T> = new (...args: any[]) => T;

export type InstanceOfMetadataCheckerConfig = {
  AggregatedResultMetadata: Constructor<AggregatedResultMetadata>;
  DescribeBlockMetadata: Constructor<DescribeBlockMetadata>;
  HookDefinitionMetadata: Constructor<HookDefinitionMetadata>;
  TestEntryMetadata: Constructor<TestEntryMetadata>;
  HookInvocationMetadata: Constructor<HookInvocationMetadata>;
  TestInvocationMetadata: Constructor<TestInvocationMetadata>;
  TestFnInvocationMetadata: Constructor<TestFnInvocationMetadata>;
  RunMetadata: Constructor<RunMetadata>;
};

export class InstanceOfMetadataChecker implements MetadataChecker {
  constructor(private readonly config: InstanceOfMetadataCheckerConfig) {}

  isAggregatedResultMetadata(metadata: Metadata | undefined): metadata is AggregatedResultMetadata {
    return metadata instanceof this.config.AggregatedResultMetadata;
  }

  isRunMetadata(metadata: Metadata | undefined): metadata is RunMetadata {
    return metadata instanceof this.config.RunMetadata;
  }

  isDescribeBlockMetadata(metadata: Metadata | undefined): metadata is DescribeBlockMetadata {
    return metadata instanceof this.config.DescribeBlockMetadata;
  }

  isHookDefinitionMetadata(metadata: Metadata | undefined): metadata is HookDefinitionMetadata {
    return metadata instanceof this.config.HookDefinitionMetadata;
  }

  isTestEntryMetadata(metadata: Metadata | undefined): metadata is TestEntryMetadata {
    return metadata instanceof this.config.TestEntryMetadata;
  }

  isHookInvocationMetadata(metadata: Metadata | undefined): metadata is HookInvocationMetadata {
    return metadata instanceof this.config.HookInvocationMetadata;
  }

  isTestInvocationMetadata(metadata: Metadata | undefined): metadata is TestInvocationMetadata {
    return metadata instanceof this.config.TestInvocationMetadata;
  }

  isTestFnInvocationMetadata(metadata: Metadata | undefined): metadata is TestFnInvocationMetadata {
    return metadata instanceof this.config.TestFnInvocationMetadata;
  }

  asTestInvocationMetadata(metadata: Metadata | undefined): TestInvocationMetadata {
    this._assert(metadata, 'TestInvocationMetadata');
    return metadata as TestInvocationMetadata;
  }

  asDescribeBlockMetadata(metadata: Metadata | undefined): DescribeBlockMetadata {
    this._assert(metadata, 'DescribeBlockMetadata');
    return metadata as DescribeBlockMetadata;
  }

  asRunMetadata(metadata: Metadata | undefined): RunMetadata {
    this._assert(metadata, 'RunMetadata');
    return metadata as RunMetadata;
  }

  asTestEntryMetadata(metadata: Metadata | undefined): TestEntryMetadata {
    this._assert(metadata, 'TestEntryMetadata');
    return metadata as TestEntryMetadata;
  }

  asAggregatedResultMetadata(metadata: Metadata | undefined): AggregatedResultMetadata {
    this._assert(metadata, 'AggregatedResultMetadata');
    return metadata as AggregatedResultMetadata;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _assert<K extends keyof InstanceOfMetadataCheckerConfig>(
    metadata: Metadata | undefined,
    klassName: K,
  ): void {
    const Klass = this.config[klassName];
    if (!(metadata instanceof Klass)) {
      throw new TypeError(`Metadata (${metadata?.id}) is not an instance of ${klassName}`);
    }
  }
}
