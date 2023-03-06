import { HookType } from '../types';

import { HookDefinitionMetadata } from './HookDefinitionMetadata';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { InvocationMetadata } from './InvocationMetadata';
import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { RunMetadata } from './RunMetadata';
import { ScopedIdentifier } from './ScopedIdentifier';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';
import {
  _addDescribeBlock,
  _addHookDefinition,
  _addTestEntry,
  _currentDescribeBlock,
  _currentTestEntry,
  _finish,
  _start,
} from './symbols';

export class DescribeBlockMetadata extends Metadata {
  readonly run: RunMetadata;
  readonly parent?: DescribeBlockMetadata;

  readonly hookDefinitions: HookDefinitionMetadata[] = [];
  readonly children: (DescribeBlockMetadata | TestEntryMetadata)[] = [];

  readonly beforeHooks: HookInvocationMetadata[] = [];
  readonly testInvocations: TestInvocationMetadata[] = [];
  readonly afterHooks: HookInvocationMetadata[] = [];

  readonly allInvocations: InvocationMetadata[] = [];

  constructor(
    context: MetadataContext,
    parent: RunMetadata | DescribeBlockMetadata,
    id: ScopedIdentifier,
  ) {
    super(context, id);

    if (parent instanceof RunMetadata) {
      this.parent = undefined;
      this.run = parent;
    } else {
      this.parent = parent;
      this.run = parent.run;
    }
  }

  [_addDescribeBlock](id: ScopedIdentifier): DescribeBlockMetadata {
    const describeBlock = new DescribeBlockMetadata(this.context, this, id);
    this.children.push(describeBlock);

    return describeBlock;
  }

  [_addTestEntry](id: ScopedIdentifier): TestEntryMetadata {
    const testEntry = new TestEntryMetadata(this.context, this, id);
    this.children.push(testEntry);
    this.run[_currentTestEntry] = testEntry;

    return testEntry;
  }

  [_addHookDefinition](id: ScopedIdentifier, hookType: HookType): HookDefinitionMetadata {
    const hookDefinition = new HookDefinitionMetadata(this.context, this, id, hookType);
    this.hookDefinitions.push(hookDefinition);

    return hookDefinition;
  }

  [_start](): void {
    this.run[_currentDescribeBlock] = this;
  }

  [_finish](): void {
    this.run[_currentDescribeBlock] = this.parent;
  }

  *describeBlocks(): IterableIterator<DescribeBlockMetadata> {
    for (const child of this.children) {
      if (child instanceof DescribeBlockMetadata) {
        yield child;
      }
    }
  }

  *testEntries(): IterableIterator<TestEntryMetadata> {
    for (const child of this.children) {
      if (child instanceof TestEntryMetadata) {
        yield child;
      }
    }
  }

  *allDescribeBlocks(): IterableIterator<DescribeBlockMetadata> {
    for (const child of this.children) {
      if (child instanceof DescribeBlockMetadata) {
        yield child;
        yield* child.allDescribeBlocks();
      }
    }
  }

  *allTestEntries(): IterableIterator<TestEntryMetadata> {
    for (const child of this.children) {
      if (child instanceof TestEntryMetadata) {
        yield child;
      } else {
        yield* child.allTestEntries();
      }
    }
  }
}
