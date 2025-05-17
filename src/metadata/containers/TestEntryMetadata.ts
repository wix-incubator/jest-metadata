import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';

import { BaseMetadata } from './BaseMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestFileMetadata } from './TestFileMetadata';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestEntryMetadata extends BaseMetadata {
  readonly invocations: TestInvocationMetadata[] = [];

  constructor(
    context: MetadataContext,
    public readonly describeBlock: DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }

  get lastInvocation(): TestInvocationMetadata | undefined {
    return this.invocations[this.invocations.length - 1];
  }

  get file(): TestFileMetadata {
    return this.describeBlock.file;
  }

  *ancestors(): IterableIterator<DescribeBlockMetadata> {
    yield this.describeBlock;
    yield* this.describeBlock.ancestors();
  }

  *allAncestors(): IterableIterator<BaseMetadata> {
    yield this.describeBlock;
    yield* this.describeBlock.allAncestors();
  }

  [symbols.start](): TestInvocationMetadata {
    const id = this[symbols.id].nest(`${this.invocations.length}`);
    const invocation = this[symbols.context].factory.createTestInvocationMetadata(this, id);

    this.invocations.push(invocation);
    this.describeBlock[symbols.pushExecution](invocation);

    const file = this.describeBlock.file;
    file[symbols.currentMetadata] = invocation;
    file[symbols.lastTestEntry] = this;

    return invocation;
  }

  [symbols.finish](skipped = false): void {
    const file = this.describeBlock.file;
    const lastInvocation = this.invocations[this.invocations.length - 1];
    if (!lastInvocation) {
      throw new Error('Cannot finish test entry without any invocations');
    }

    file[symbols.currentMetadata] = this.describeBlock;
    if (!skipped) {
      file[symbols.reportedTestEntries].push(this);
    }
  }
}
