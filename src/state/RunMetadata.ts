import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { InvocationMetadata } from './InvocationMetadata';
import { Metadata } from './Metadata';
import { ScopedIdentifier } from './ScopedIdentifier';
import { TestEntryMetadata } from './TestEntryMetadata';
import {
  _rootDescribeBlock,
  _currentDescribeBlock,
  _currentTestEntry,
  _addDescribeBlock,
} from './symbols';

export class RunMetadata extends Metadata {
  [_rootDescribeBlock]: DescribeBlockMetadata | undefined;
  [_currentDescribeBlock]: DescribeBlockMetadata | undefined;
  [_currentTestEntry]: TestEntryMetadata | undefined;

  get rootDescribeBlock(): DescribeBlockMetadata {
    if (!this[_rootDescribeBlock]) {
      throw new Error('No root describe block');
    }

    return this[_rootDescribeBlock];
  }

  get currentDescribeBlock(): DescribeBlockMetadata {
    if (!this[_currentDescribeBlock]) {
      throw new Error('No current describe block');
    }

    return this[_currentDescribeBlock];
  }

  [_addDescribeBlock](id: ScopedIdentifier): DescribeBlockMetadata {
    if (this[_currentDescribeBlock]) {
      this[_currentDescribeBlock] = this[_currentDescribeBlock][_addDescribeBlock](id);
    } else {
      if (this[_rootDescribeBlock]) {
        throw new Error('Root describe block already exists');
      }

      this[_rootDescribeBlock] = new DescribeBlockMetadata(this.context, this, id);
      this[_currentDescribeBlock] = this[_rootDescribeBlock];
    }

    return this[_currentDescribeBlock];
  }

  *allDescribeBlocks(): IterableIterator<DescribeBlockMetadata> {
    if (this[_rootDescribeBlock]) {
      yield this[_rootDescribeBlock];
      yield* this[_rootDescribeBlock].allDescribeBlocks();
    }
  }

  *allTestEntries(): IterableIterator<TestEntryMetadata> {
    if (this[_rootDescribeBlock]) {
      yield* this[_rootDescribeBlock].allTestEntries();
    }
  }

  *allInvocations(): IterableIterator<InvocationMetadata> {
    if (this[_rootDescribeBlock]) {
      yield* this[_rootDescribeBlock].allInvocations;
    }
  }
}
