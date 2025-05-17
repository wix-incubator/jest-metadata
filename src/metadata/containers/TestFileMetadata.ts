import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';

import { BaseMetadata } from './BaseMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { GlobalMetadata } from './GlobalMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestEntryMetadata } from './TestEntryMetadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestFileMetadata extends BaseMetadata {
  [symbols.rootDescribeBlock]: DescribeBlockMetadata | undefined;
  [symbols.lastTestEntry]: TestEntryMetadata | undefined;
  [symbols.reportedTestEntries]: TestEntryMetadata[] = [];
  [symbols.currentMetadata]: BaseMetadata = this;

  readonly current = this[symbols.context].createMetadataSelector(
    () => this[symbols.currentMetadata],
  );

  constructor(
    context: MetadataContext,
    id: AggregatedIdentifier,
    public readonly globalMetadata: GlobalMetadata,
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
    this[symbols.lastTestEntry] = undefined;
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

  /**
   * A specialized method to access test entries based on Jest's reporting sequence.
   * For internal use only - handles race conditions and inconsistencies in Jest's
   * reporting behavior (particularly with skipped vs. todo tests).
   *
   * @internal
   */
  _getReportedEntryByIndex(index: number): TestEntryMetadata | undefined {
    return this[symbols.reportedTestEntries][index];
  }
}
