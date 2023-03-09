import { Metadata } from './Metadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';
import { MetadataContext } from './MetadataContext';
import { AggregatedIdentifier } from './utils/AggregatedIdentifier';
import * as symbols from './symbols';

export class TestEntryMetadata extends Metadata {
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

  *ancestors(): IterableIterator<DescribeBlockMetadata> {
    let it: DescribeBlockMetadata | undefined = this.describeBlock;
    while (it) {
      yield it;
      it = it.parent;
    }
  }

  [symbols.start](): TestInvocationMetadata {
    const id = this[symbols.id].nest(`${this.invocations.length}`);
    const invocation = new TestInvocationMetadata(this[symbols.context], this, id);

    this.invocations.push(invocation);
    this.describeBlock.invocations.push(invocation);

    const run = this.describeBlock.run;
    run[symbols.currentMetadata] = invocation;

    return invocation;
  }

  [symbols.finish](): void {
    const run = this.describeBlock.run;
    const lastInvocation = this.invocations[this.invocations.length - 1];
    if (!lastInvocation) {
      throw new Error('Cannot finish test entry without any invocations');
    }

    run[symbols.currentMetadata] = this.describeBlock;
  }
}
