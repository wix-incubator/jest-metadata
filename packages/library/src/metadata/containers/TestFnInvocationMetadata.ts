import type { AggregatedIdentifier, MetadataContext } from '../misc';

import { Metadata } from './Metadata';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestFnInvocationMetadata extends Metadata {
  constructor(
    context: MetadataContext,
    public readonly test: TestInvocationMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }
}
