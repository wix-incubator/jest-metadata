import type { MetadataChecker } from '../checker';
import type {
  BaseMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  RunMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../containers';
import type { MetadataSelector } from './MetadataSelector';

export class MetadataSelectorImpl implements MetadataSelector {
  constructor(readonly check: MetadataChecker, readonly value: () => BaseMetadata | undefined) {}

  get run(): RunMetadata | undefined {
    const metadata = this.value();

    if (this.check.isRunMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isDescribeBlockMetadata(metadata)) {
      return metadata.run;
    }

    if (this.check.isTestEntryMetadata(metadata)) {
      return metadata.describeBlock.run;
    }

    if (this.check.isHookDefinitionMetadata(metadata)) {
      return metadata.owner.run;
    }

    if (this.check.isHookInvocationMetadata(metadata)) {
      return metadata.definition.owner.run;
    }

    if (this.check.isTestInvocationMetadata(metadata)) {
      return metadata.entry.describeBlock.run;
    }

    if (this.check.isTestFnInvocationMetadata(metadata)) {
      return metadata.test.entry.describeBlock.run;
    }

    return;
  }

  get describeBlock(): DescribeBlockMetadata | undefined {
    const metadata = this.value();

    if (this.check.isDescribeBlockMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isHookDefinitionMetadata(metadata)) {
      return metadata.owner;
    }

    if (this.check.isHookInvocationMetadata(metadata)) {
      return metadata.definition.owner;
    }

    if (this.check.isTestEntryMetadata(metadata)) {
      return metadata.describeBlock;
    }

    if (this.check.isTestInvocationMetadata(metadata)) {
      return metadata.entry.describeBlock;
    }

    if (this.check.isTestFnInvocationMetadata(metadata)) {
      return metadata.test.entry.describeBlock;
    }

    return;
  }

  get testEntry(): TestEntryMetadata | undefined {
    const metadata = this.value();

    if (this.check.isTestEntryMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isTestInvocationMetadata(metadata)) {
      return metadata.entry;
    }

    if (
      this.check.isHookInvocationMetadata(metadata) &&
      this.check.isTestEntryMetadata(metadata.definition.owner)
    ) {
      return metadata.definition.owner;
    }

    if (this.check.isTestFnInvocationMetadata(metadata)) {
      return metadata.test.entry;
    }

    return;
  }

  get hookDefinition(): HookDefinitionMetadata | undefined {
    const metadata = this.value();

    if (this.check.isHookDefinitionMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isHookInvocationMetadata(metadata)) {
      return metadata.definition;
    }

    return;
  }

  get definition(): DescribeBlockMetadata | HookDefinitionMetadata | TestEntryMetadata | undefined {
    return this.hookDefinition ?? this.testEntry ?? this.describeBlock;
  }

  get testFnInvocation(): TestFnInvocationMetadata | undefined {
    const metadata = this.value();

    if (this.check.isTestFnInvocationMetadata(metadata)) {
      return metadata;
    }

    return;
  }

  get hookInvocation(): HookInvocationMetadata | undefined {
    const metadata = this.value();

    if (this.check.isHookInvocationMetadata(metadata)) {
      return metadata;
    }

    return;
  }

  get testInvocation(): TestInvocationMetadata | undefined {
    const metadata = this.value();

    if (this.check.isTestInvocationMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isTestFnInvocationMetadata(metadata)) {
      return metadata.test;
    }

    if (
      this.check.isHookInvocationMetadata(metadata) &&
      this.check.isTestInvocationMetadata(metadata.parent)
    ) {
      return metadata.parent;
    }

    return;
  }

  get invocationParent(): TestInvocationMetadata | DescribeBlockMetadata | undefined {
    const metadata = this.value();

    if (this.check.isDescribeBlockMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isHookInvocationMetadata(metadata)) {
      return metadata.parent;
    }

    if (this.check.isTestFnInvocationMetadata(metadata)) {
      return metadata.test;
    }

    if (this.check.isTestInvocationMetadata(metadata)) {
      return metadata;
    }

    return;
  }

  get invocation():
    | RunMetadata
    | DescribeBlockMetadata
    | HookInvocationMetadata
    | TestInvocationMetadata
    | TestFnInvocationMetadata
    | undefined {
    const metadata = this.value();

    if (this.check.isRunMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isDescribeBlockMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isHookInvocationMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isTestInvocationMetadata(metadata)) {
      return metadata;
    }

    if (this.check.isTestFnInvocationMetadata(metadata)) {
      return metadata;
    }

    return;
  }
}
