import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';

import type { AggregatedResultMetadata } from './AggregatedResultMetadata';
import { BaseMetadata } from './BaseMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestEntryMetadata } from './TestEntryMetadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

export class RunMetadata extends BaseMetadata {
  [symbols.rootDescribeBlock]: DescribeBlockMetadata | undefined;
  [symbols.lastTestEntry]: TestEntryMetadata | undefined;
  [symbols.currentMetadata]: BaseMetadata = this;

  readonly current = this[symbols.context].createMetadataSelector(
    () => this[symbols.currentMetadata],
  );

  constructor(
    context: MetadataContext,
    id: AggregatedIdentifier,
    public readonly aggregatedResult: AggregatedResultMetadata,
  ) {
    super(context, id);
  }

  get rootDescribeBlock(): DescribeBlockMetadata | undefined {
    return this[symbols.rootDescribeBlock];
  }

  get lastTestEntry(): TestEntryMetadata | undefined {
    return this[symbols.lastTestEntry];
  }

  [symbols.addDescribeBlock](id: AggregatedIdentifier): DescribeBlockMetadata {
    if (this[symbols.rootDescribeBlock]) {
      throw new Error('Unexpected state: root describe block already exists');
    }

    this[symbols.currentMetadata] = this[symbols.rootDescribeBlock] = this[
      symbols.context
    ].factory.createDescribeBlockMetadata(this, id);

    return this[symbols.rootDescribeBlock];
  }

  [symbols.start](): void {
    this[symbols.currentMetadata] = this;
  }

  [symbols.finish](): void {
    // Nothing to do yet
  }

  *allDescribeBlocks(): IterableIterator<DescribeBlockMetadata> {
    if (this[symbols.rootDescribeBlock]) {
      yield this[symbols.rootDescribeBlock];
      yield* this[symbols.rootDescribeBlock].allDescribeBlocks();
    }
  }

  *allTestEntries(): IterableIterator<TestEntryMetadata> {
    if (this[symbols.rootDescribeBlock]) {
      yield* this[symbols.rootDescribeBlock].allTestEntries();
    }
  }

  *allInvocations(): IterableIterator<HookInvocationMetadata | TestFnInvocationMetadata> {
    if (this[symbols.rootDescribeBlock]) {
      yield* this[symbols.rootDescribeBlock].allInvocations();
    }
  }

  *allTestInvocations(): IterableIterator<TestInvocationMetadata> {
    if (this[symbols.rootDescribeBlock]) {
      yield* this[symbols.rootDescribeBlock].allTestInvocations();
    }
  }
}
