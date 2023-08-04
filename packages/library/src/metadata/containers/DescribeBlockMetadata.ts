import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';
import type { HookType } from '../types';

import { BaseMetadata } from './BaseMetadata';
import type { HookDefinitionMetadata } from './HookDefinitionMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { MetadataContext } from './MetadataContext';
import type { RunMetadata } from './RunMetadata';
import type { TestEntryMetadata } from './TestEntryMetadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

type DefinitionMetadata = DescribeBlockMetadata | TestEntryMetadata | HookDefinitionMetadata;
type InvocationMetadata =
  | DescribeBlockMetadata
  | TestInvocationMetadata
  | HookInvocationMetadata<DescribeBlockMetadata>;

export class DescribeBlockMetadata extends BaseMetadata {
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

    if (context.checker.isRunMetadata(parent)) {
      this.parent = undefined;
      this.run = parent;
    } else {
      this.parent = parent;
      this.run = parent.run;
    }
  }

  [symbols.addDescribeBlock](id: AggregatedIdentifier): DescribeBlockMetadata {
    const describeBlock = this[symbols.context].factory.createDescribeBlockMetadata(this, id);
    this.children.push(describeBlock);
    this.run[symbols.currentMetadata] = describeBlock;

    return describeBlock;
  }

  [symbols.addTestEntry](id: AggregatedIdentifier): TestEntryMetadata {
    const testEntry = this[symbols.context].factory.createTestEntryMetadata(this, id);

    this.children.push(testEntry);
    this.run[symbols.currentMetadata] = testEntry;

    return testEntry;
  }

  [symbols.addHookDefinition](
    id: AggregatedIdentifier,
    hookType: HookType,
  ): HookDefinitionMetadata {
    const hookDefinition = this[symbols.context].factory.createHookDefinitionMetadata(
      this,
      id,
      hookType,
    );
    this.children.push(hookDefinition);
    this.run[symbols.currentMetadata] = hookDefinition;

    return hookDefinition;
  }

  [symbols.start](): void {
    this.run[symbols.currentMetadata] = this;
    this.parent?.invocations.push(this);
  }

  [symbols.finish](): void {
    this.run[symbols.currentMetadata] = this.parent ?? this.run;
  }

  *describeBlocks(): IterableIterator<DescribeBlockMetadata> {
    const checker = this[symbols.context].checker;

    for (const child of this.children) {
      if (checker.isDescribeBlockMetadata(child)) {
        yield child;
      }
    }
  }

  *testEntries(): IterableIterator<TestEntryMetadata> {
    const checker = this[symbols.context].checker;

    for (const child of this.children) {
      if (checker.isTestEntryMetadata(child)) {
        yield child;
      }
    }
  }

  *hookDefinitions(): IterableIterator<HookDefinitionMetadata> {
    const checker = this[symbols.context].checker;

    for (const child of this.children) {
      if (checker.isHookDefinitionMetadata(child)) {
        yield child;
      }
    }
  }

  *allDescribeBlocks(): IterableIterator<DescribeBlockMetadata> {
    const checker = this[symbols.context].checker;

    for (const child of this.children) {
      if (checker.isDescribeBlockMetadata(child)) {
        yield child;
        yield* child.allDescribeBlocks();
      }
    }
  }

  *allTestEntries(): IterableIterator<TestEntryMetadata> {
    const checker = this[symbols.context].checker;

    for (const child of this.children) {
      if (checker.isTestEntryMetadata(child)) {
        yield child;
      } else if (checker.isDescribeBlockMetadata(child)) {
        yield* child.allTestEntries();
      }
    }
  }

  *allInvocations(): IterableIterator<HookInvocationMetadata | TestFnInvocationMetadata> {
    const checker = this[symbols.context].checker;

    for (const invocation of this.invocations) {
      if (checker.isHookInvocationMetadata(invocation)) {
        yield invocation;
      } else if (checker.isDescribeBlockMetadata(invocation)) {
        yield* invocation.allInvocations();
      } else if (checker.isTestInvocationMetadata(invocation)) {
        yield* invocation.before;
        if (invocation.fn) {
          yield invocation.fn;
        }
        yield* invocation.after;
      }
    }
  }
}
