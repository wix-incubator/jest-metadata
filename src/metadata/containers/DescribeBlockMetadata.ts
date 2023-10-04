import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';
import type { HookType } from '../types';

import { BaseMetadata } from './BaseMetadata';
import type { HookDefinitionMetadata } from './HookDefinitionMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestEntryMetadata } from './TestEntryMetadata';
import type { TestFileMetadata } from './TestFileMetadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

type DefinitionMetadata = DescribeBlockMetadata | TestEntryMetadata | HookDefinitionMetadata;
type ExecutionMetadata =
  | DescribeBlockMetadata
  | TestInvocationMetadata
  | HookInvocationMetadata<DescribeBlockMetadata>;

export class DescribeBlockMetadata extends BaseMetadata {
  readonly file: TestFileMetadata;
  readonly parent?: DescribeBlockMetadata;
  readonly children: DefinitionMetadata[] = [];
  readonly executions: ExecutionMetadata[] = [];

  #pendingBeforeAll: HookInvocationMetadata<DescribeBlockMetadata>[] = [];
  #pendingAfterAll: HookInvocationMetadata<DescribeBlockMetadata>[] = [];
  #firstTestInvocation?: TestInvocationMetadata;
  #lastAttachable?: DescribeBlockMetadata | TestInvocationMetadata;

  constructor(
    context: MetadataContext,
    parent: TestFileMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);

    if (context.checker.isTestFileMetadata(parent)) {
      this.parent = undefined;
      this.file = parent;
    } else {
      this.parent = parent;
      this.file = parent.file;
    }
  }

  [symbols.addDescribeBlock](id: AggregatedIdentifier): DescribeBlockMetadata {
    const describeBlock = this[symbols.context].factory.createDescribeBlockMetadata(this, id);
    this.children.push(describeBlock);
    this.file[symbols.currentMetadata] = describeBlock;

    return describeBlock;
  }

  [symbols.addTestEntry](id: AggregatedIdentifier): TestEntryMetadata {
    const testEntry = this[symbols.context].factory.createTestEntryMetadata(this, id);

    this.children.push(testEntry);
    this.file[symbols.currentMetadata] = testEntry;
    this.file[symbols.lastTestEntry] = testEntry;

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
    this.file[symbols.currentMetadata] = hookDefinition;

    return hookDefinition;
  }

  [symbols.pushExecution](metadata: ExecutionMetadata): void {
    this.executions.push(metadata);

    const { checker } = this[symbols.context];
    if (checker.isHookInvocationMetadata(metadata)) {
      if (metadata.definition.hookType === 'afterAll') {
        this.#pendingAfterAll.push(metadata);
      } else {
        this.#pendingBeforeAll.push(metadata);
      }
    } else {
      if (!this.#firstTestInvocation && checker.isTestInvocationMetadata(metadata)) {
        this.#firstTestInvocation = metadata;
      }

      this.#lastAttachable = metadata;
    }
  }

  [symbols.pushBeforeAll](testInvocation: TestInvocationMetadata): void {
    if (this.parent) {
      this.parent[symbols.pushBeforeAll](testInvocation);
    }

    if (this.#pendingBeforeAll.length > 0) {
      testInvocation[symbols.pushBeforeAll](this.#pendingBeforeAll.splice(0));
    }
  }

  [symbols.pushAfterAll](invocations: HookInvocationMetadata<DescribeBlockMetadata>[]): void {
    this.#lastAttachable?.[symbols.pushAfterAll](invocations);
  }

  [symbols.start](): void {
    this.file[symbols.currentMetadata] = this;
    this.parent?.[symbols.pushExecution](this);
  }

  [symbols.finish](): void {
    this.file[symbols.currentMetadata] = this.parent ?? this.file;

    if (this.#pendingBeforeAll.length > 0 && this.#firstTestInvocation) {
      // NOTE: special case when it.todo() is the only test in a describe block
      // For some unknown reason, the hooks surrounding it are executed, so
      // it's better not to lose the information about them.
      this[symbols.pushBeforeAll](this.#firstTestInvocation);
    }

    if (this.#pendingAfterAll.length > 0) {
      this[symbols.pushAfterAll](this.#pendingAfterAll.splice(0));
    }
  }

  *ancestors(): IterableIterator<DescribeBlockMetadata> {
    let it: DescribeBlockMetadata | undefined = this;
    while ((it = it.parent)) {
      yield it;
    }
  }

  *allAncestors(): IterableIterator<BaseMetadata> {
    yield* this.ancestors();
    yield this.file;
    yield this.file.globalMetadata;
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

    for (const execution of this.executions) {
      if (checker.isHookInvocationMetadata(execution)) {
        yield execution;
      } else if (checker.isDescribeBlockMetadata(execution)) {
        yield* execution.allInvocations();
      } else if (checker.isTestInvocationMetadata(execution)) {
        yield* execution.invocations();
      }
    }
  }

  *allTestInvocations(): IterableIterator<TestInvocationMetadata> {
    const checker = this[symbols.context].checker;

    for (const execution of this.executions) {
      if (checker.isDescribeBlockMetadata(execution)) {
        yield* execution.allTestInvocations();
      } else if (checker.isTestInvocationMetadata(execution)) {
        yield execution;
      }
    }
  }
}
