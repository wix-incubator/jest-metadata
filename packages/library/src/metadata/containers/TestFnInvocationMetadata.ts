import { AggregatedIdentifier, MetadataContext } from '../misc';

import { Metadata } from './Metadata';
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
