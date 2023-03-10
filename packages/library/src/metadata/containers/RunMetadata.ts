import { AggregatedIdentifier } from '../misc';
import * as symbols from '../symbols';

import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { Metadata } from './Metadata';
import { MetadataSelector } from '../MetadataSelector';
import { TestEntryMetadata } from './TestEntryMetadata';

export class RunMetadata extends Metadata {
  [symbols.rootDescribeBlock]: DescribeBlockMetadata | undefined;
  [symbols.currentMetadata]: Metadata | undefined;

  // eslint-disable-next-line unicorn/consistent-function-scoping
  readonly current = new MetadataSelector(() => this[symbols.currentMetadata]);

  get rootDescribeBlock(): DescribeBlockMetadata | undefined {
    return this[symbols.rootDescribeBlock];
  }

  [symbols.addDescribeBlock](id: AggregatedIdentifier): DescribeBlockMetadata {
    if (this[symbols.rootDescribeBlock]) {
      throw new Error('Unexpected state: root describe block already exists');
    }

    this[symbols.currentMetadata] = this[symbols.rootDescribeBlock] = new DescribeBlockMetadata(
      this[symbols.context],
      this,
      id,
    );

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
