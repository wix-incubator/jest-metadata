import { Metadata } from './Metadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';
import { MetadataContext } from './MetadataContext';
import { ScopedIdentifier } from './ScopedIdentifier';

export class TestEntryMetadata extends Metadata {
  // readonly testFn = new TestFnDefinitionMetadata(this.api, this);
  readonly invocations: TestInvocationMetadata[] = [];

  constructor(
    context: MetadataContext,
    public readonly parent: DescribeBlockMetadata,
    id: ScopedIdentifier,
  ) {
    super(context, id);
  }

  *ancestors(): IterableIterator<DescribeBlockMetadata> {
    let it: DescribeBlockMetadata | undefined = this.parent;
    while (it) {
      yield it;
      it = it.parent;
    }
  }
}
