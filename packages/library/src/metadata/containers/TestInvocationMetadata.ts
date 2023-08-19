import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';

import { BaseMetadata } from './BaseMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestEntryMetadata } from './TestEntryMetadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';

export class TestInvocationMetadata extends BaseMetadata {
  readonly beforeAll: HookInvocationMetadata<DescribeBlockMetadata>[] = [];
  readonly before: HookInvocationMetadata<TestInvocationMetadata>[] = [];
  fn?: TestFnInvocationMetadata;
  readonly after: HookInvocationMetadata<TestInvocationMetadata>[] = [];
  readonly afterAll: HookInvocationMetadata<DescribeBlockMetadata>[] = [];

  constructor(
    context: MetadataContext,
    public readonly entry: TestEntryMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }

  [symbols.start](): void {
    const id = this[symbols.id].nest('fn');
    const fn = this[symbols.context].factory.createTestFnInvocationMetadata(this, id);
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this.fn = fn;
    this.entry.describeBlock[symbols.pushBeforeAll](this);
  }

  [symbols.pushBeforeAll](metadatas: HookInvocationMetadata<DescribeBlockMetadata>[]): void {
    this.beforeAll.push(...metadatas);
  }

  [symbols.pushAfterAll](metadatas: HookInvocationMetadata<DescribeBlockMetadata>[]): void {
    this.afterAll.push(...metadatas);
  }

  [symbols.finish](): void {
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this;
  }

  *invocations(): IterableIterator<
    HookInvocationMetadata<TestInvocationMetadata> | TestFnInvocationMetadata
  > {
    yield* this.before;
    if (this.fn) {
      yield this.fn;
    }
    yield* this.after;
  }

  *allInvocations(): IterableIterator<HookInvocationMetadata | TestFnInvocationMetadata> {
    yield* this.beforeAll;
    yield* this.invocations();
    yield* this.afterAll;
  }

  *allAncestors(): IterableIterator<BaseMetadata> {
    yield this.entry;
    yield* this.entry.allAncestors();
  }
}
