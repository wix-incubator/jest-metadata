import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';

import { BaseMetadata } from './BaseMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { TestEntryMetadata } from './TestEntryMetadata';

export class RunMetadata extends BaseMetadata {
  [symbols.rootDescribeBlock]: DescribeBlockMetadata | undefined;
  [symbols.lastTestEntry]: TestEntryMetadata | undefined;
  [symbols.currentMetadata]: BaseMetadata = this;

  readonly current = this[symbols.context].createMetadataSelector(
    () => this[symbols.currentMetadata],
  );

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

  *allInvocations() {
    if (this[symbols.rootDescribeBlock]) {
      yield* this[symbols.rootDescribeBlock].allInvocations();
    }
  }
}
