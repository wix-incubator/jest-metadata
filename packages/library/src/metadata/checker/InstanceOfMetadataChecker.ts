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
import type { MetadataChecker } from './MetadataChecker';

type Constructor<T> = new (...args: any[]) => T;

export type InstanceOfMetadataCheckerConfig = {
  GlobalMetadata: Constructor<GlobalMetadata>;
  DescribeBlockMetadata: Constructor<DescribeBlockMetadata>;
  HookDefinitionMetadata: Constructor<HookDefinitionMetadata>;
  TestEntryMetadata: Constructor<TestEntryMetadata>;
  HookInvocationMetadata: Constructor<HookInvocationMetadata>;
  TestInvocationMetadata: Constructor<TestInvocationMetadata>;
  TestFnInvocationMetadata: Constructor<TestFnInvocationMetadata>;
  TestFileMetadata: Constructor<TestFileMetadata>;
};

export class InstanceOfMetadataChecker implements MetadataChecker {
  constructor(private readonly config: InstanceOfMetadataCheckerConfig) {}

  isGlobalMetadata(metadata: Metadata | undefined): metadata is GlobalMetadata {
    return metadata instanceof this.config.GlobalMetadata;
  }

  isTestFileMetadata(metadata: Metadata | undefined): metadata is TestFileMetadata {
    return metadata instanceof this.config.TestFileMetadata;
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

  asTestFileMetadata(metadata: Metadata | undefined): TestFileMetadata {
    this._assert(metadata, 'TestFileMetadata');
    return metadata as TestFileMetadata;
  }

  asTestEntryMetadata(metadata: Metadata | undefined): TestEntryMetadata {
    this._assert(metadata, 'TestEntryMetadata');
    return metadata as TestEntryMetadata;
  }

  asGlobalMetadata(metadata: Metadata | undefined): GlobalMetadata {
    this._assert(metadata, 'GlobalMetadata');
    return metadata as GlobalMetadata;
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
