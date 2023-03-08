import { Metadata } from './Metadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { HookDefinitionMetadata } from './HookDefinitionMetadata';
import { TestEntryMetadata } from './TestEntryMetadata';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';
import { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import { RunMetadata } from './RunMetadata';

export class MetadataSelector {
  constructor(readonly value: () => Metadata | undefined) {}

  get describeBlock(): DescribeBlockMetadata | undefined {
    const metadata = this.value();

    if (metadata instanceof DescribeBlockMetadata) {
      return metadata;
    }

    if (metadata instanceof HookDefinitionMetadata) {
      return metadata.owner;
    }

    if (metadata instanceof HookInvocationMetadata) {
      return metadata.definition.owner;
    }

    if (metadata instanceof TestEntryMetadata) {
      return metadata.describeBlock;
    }

    if (metadata instanceof TestInvocationMetadata) {
      return metadata.entry.describeBlock;
    }

    if (metadata instanceof TestFnInvocationMetadata) {
      return metadata.test.entry.describeBlock;
    }

    return;
  }

  get testEntry(): TestEntryMetadata | undefined {
    const metadata = this.value();

    if (metadata instanceof TestEntryMetadata) {
      return metadata;
    }

    if (metadata instanceof TestInvocationMetadata) {
      return metadata.entry;
    }

    if (
      metadata instanceof HookInvocationMetadata &&
      metadata.definition.owner instanceof TestEntryMetadata
    ) {
      return metadata.definition.owner;
    }

    if (metadata instanceof TestFnInvocationMetadata) {
      return metadata.test.entry;
    }

    return;
  }

  get hookDefinition(): HookDefinitionMetadata | undefined {
    const metadata = this.value();

    if (metadata instanceof HookDefinitionMetadata) {
      return metadata;
    }

    if (metadata instanceof HookInvocationMetadata) {
      return metadata.definition;
    }

    return;
  }

  get definition(): DescribeBlockMetadata | HookDefinitionMetadata | TestEntryMetadata | undefined {
    return this.hookDefinition ?? this.testEntry ?? this.describeBlock;
  }

  get testFnInvocation(): TestFnInvocationMetadata | undefined {
    const metadata = this.value();

    if (metadata instanceof TestFnInvocationMetadata) {
      return metadata;
    }

    return;
  }

  get hookInvocation(): HookInvocationMetadata | undefined {
    const metadata = this.value();

    if (metadata instanceof HookInvocationMetadata) {
      return metadata;
    }

    return;
  }

  get testInvocation(): TestInvocationMetadata | undefined {
    const metadata = this.value();

    if (metadata instanceof TestInvocationMetadata) {
      return metadata;
    }

    if (metadata instanceof TestFnInvocationMetadata) {
      return metadata.test;
    }

    if (
      metadata instanceof HookInvocationMetadata &&
      metadata.parent instanceof TestInvocationMetadata
    ) {
      return metadata.parent;
    }

    return;
  }

  get invocationParent(): TestInvocationMetadata | DescribeBlockMetadata | undefined {
    const metadata = this.value();

    if (metadata instanceof DescribeBlockMetadata) {
      return metadata;
    }

    if (metadata instanceof HookInvocationMetadata) {
      return metadata.parent;
    }

    if (metadata instanceof TestFnInvocationMetadata) {
      return metadata.test;
    }

    if (metadata instanceof TestInvocationMetadata) {
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

    if (metadata instanceof RunMetadata) {
      return metadata;
    }

    if (metadata instanceof DescribeBlockMetadata) {
      return metadata;
    }

    if (metadata instanceof HookInvocationMetadata) {
      return metadata;
    }

    if (metadata instanceof TestInvocationMetadata) {
      return metadata;
    }

    if (metadata instanceof TestFnInvocationMetadata) {
      return metadata;
    }

    return;
  }
}
