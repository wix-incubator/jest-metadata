import { Metadata } from './Metadata';

import { TestEntryMetadata } from './TestEntryMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { HookDefinitionMetadata } from './HookDefinitionMetadata';

export class DescribeBlockMetadata extends Metadata {
  parent?: DescribeBlockMetadata;
  readonly hookDefinitions: HookDefinitionMetadata[] = [];
  readonly children: (DescribeBlockMetadata | TestEntryMetadata)[] = [];

  readonly beforeHooks: HookInvocationMetadata[] = [];
  readonly afterHooks: HookInvocationMetadata[] = [];
  readonly testInvocations: TestInvocationMetadata[] = [];

  allTestEntries(): IterableIterator<TestEntryMetadata> {
    throw new Error('Not implemented');
  }

  allTestInvocations(): IterableIterator<TestInvocationMetadata> {
    throw new Error('Not implemented');
  }
}
