import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';

import type { InvocationMetadata } from '../types';
import { BaseMetadata } from './BaseMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestEntryMetadata } from './TestEntryMetadata';
import type { TestFileMetadata } from './TestFileMetadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';

export class TestInvocationMetadata extends BaseMetadata implements InvocationMetadata {
  readonly beforeAll: HookInvocationMetadata<DescribeBlockMetadata>[] = [];
  readonly beforeEach: HookInvocationMetadata<TestInvocationMetadata>[] = [];
  fn?: TestFnInvocationMetadata;
  readonly afterEach: HookInvocationMetadata<TestInvocationMetadata>[] = [];
  readonly afterAll: HookInvocationMetadata<DescribeBlockMetadata>[] = [];

  constructor(
    context: MetadataContext,
    public readonly definition: TestEntryMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }

  get file(): TestFileMetadata {
    return this.definition.file;
  }

  [symbols.start](): void {
    const id = this[symbols.id].nest('fn');
    const fn = this[symbols.context].factory.createTestFnInvocationMetadata(this, id);
    const file = this.definition.describeBlock.file;
    file[symbols.currentMetadata] = this.fn = fn;
    this.definition.describeBlock[symbols.pushBeforeAll](this);
  }

  [symbols.pushBeforeAll](metadatas: HookInvocationMetadata<DescribeBlockMetadata>[]): void {
    this.beforeAll.push(...metadatas);
  }

  [symbols.pushAfterAll](metadatas: HookInvocationMetadata<DescribeBlockMetadata>[]): void {
    this.afterAll.push(...metadatas);
  }

  [symbols.finish](): void {
    const file = this.definition.describeBlock.file;
    file[symbols.currentMetadata] = this;
  }

  *invocations(): IterableIterator<
    HookInvocationMetadata<TestInvocationMetadata> | TestFnInvocationMetadata
  > {
    yield* this.beforeEach;
    if (this.fn) {
      yield this.fn;
    }
    yield* this.afterEach;
  }

  *allInvocations(): IterableIterator<HookInvocationMetadata | TestFnInvocationMetadata> {
    yield* this.beforeAll;
    yield* this.invocations();
    yield* this.afterAll;
  }

  *allAncestors(): IterableIterator<BaseMetadata> {
    yield this.definition;
    yield* this.definition.allAncestors();
  }
}
