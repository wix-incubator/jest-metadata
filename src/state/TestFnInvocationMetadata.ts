import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { ScopedIdentifier } from './ScopedIdentifier';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestFnInvocationMetadata extends Metadata {
  constructor(
    context: MetadataContext,
    public readonly test: TestInvocationMetadata,
    id: ScopedIdentifier,
  ) {
    super(context, id);
  }
}
