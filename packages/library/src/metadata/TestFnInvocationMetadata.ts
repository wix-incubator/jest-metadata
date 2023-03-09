import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { AggregatedIdentifier } from './utils/AggregatedIdentifier';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestFnInvocationMetadata extends Metadata {
  constructor(
    context: MetadataContext,
    public readonly test: TestInvocationMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }
}
