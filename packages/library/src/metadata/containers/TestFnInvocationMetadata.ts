import type { AggregatedIdentifier } from '../ids';
import { BaseMetadata } from './BaseMetadata';
import type { MetadataContext } from './MetadataContext';

import type { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestFnInvocationMetadata extends BaseMetadata {
  constructor(
    context: MetadataContext,
    public readonly test: TestInvocationMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }
}
