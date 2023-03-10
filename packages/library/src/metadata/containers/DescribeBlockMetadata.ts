import { HookType } from '../../types';
import { AggregatedIdentifier, MetadataContext } from '../misc';
import * as symbols from '../symbols';

import { HookDefinitionMetadata } from './HookDefinitionMetadata';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { Metadata } from './Metadata';
import { RunMetadata } from './RunMetadata';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

type DefinitionMetadata = DescribeBlockMetadata | TestEntryMetadata | HookDefinitionMetadata;
type InvocationMetadata =
  | DescribeBlockMetadata
  | TestInvocationMetadata
  | HookInvocationMetadata<DescribeBlockMetadata>;
type LowLevelInvocationMetadata = HookInvocationMetadata | TestFnInvocationMetadata;

export class DescribeBlockMetadata extends Metadata {
  readonly run: RunMetadata;
  readonly parent?: DescribeBlockMetadata;
  readonly children: DefinitionMetadata[] = [];
  readonly invocations: InvocationMetadata[] = [];

  constructor(
    context: MetadataContext,
    parent: RunMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
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

  [symbols.addDescribeBlock](id: AggregatedIdentifier): DescribeBlockMetadata {
    const describeBlock = new DescribeBlockMetadata(this[symbols.context], this, id);
    this.children.push(describeBlock);
    this.run[symbols.currentMetadata] = describeBlock;

    return describeBlock;
  }

  [symbols.addTestEntry](id: AggregatedIdentifier): TestEntryMetadata {
    const testEntry = new TestEntryMetadata(this[symbols.context], this, id);
    this.children.push(testEntry);
    this.run[symbols.currentMetadata] = testEntry;

    return testEntry;
  }

  [symbols.addHookDefinition](
    id: AggregatedIdentifier,
    hookType: HookType,
  ): HookDefinitionMetadata {
    const hookDefinition = new HookDefinitionMetadata(this[symbols.context], this, id, hookType);
    this.children.push(hookDefinition);
    this.run[symbols.currentMetadata] = hookDefinition;

    return hookDefinition;
  }

  [symbols.start](): void {
    this.run[symbols.currentMetadata] = this;
    this.parent?.invocations.push(this);
  }

  [symbols.finish](): void {
    this.run[symbols.currentMetadata] = this.parent;
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

  *hookDefinitions(): IterableIterator<HookDefinitionMetadata> {
    for (const child of this.children) {
      if (child instanceof HookDefinitionMetadata) {
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
      } else if (child instanceof DescribeBlockMetadata) {
        yield* child.allTestEntries();
      }
    }
  }

  *allInvocations(): IterableIterator<LowLevelInvocationMetadata> {
    for (const invocation of this.invocations) {
      if (invocation instanceof HookInvocationMetadata) {
        yield invocation;
      } else if (invocation instanceof DescribeBlockMetadata) {
        yield* invocation.allInvocations();
      } else if (invocation instanceof TestInvocationMetadata) {
        yield* invocation.before;
        if (invocation.fn) {
          yield invocation.fn;
        }
        yield* invocation.after;
      }
    }
  }
}
