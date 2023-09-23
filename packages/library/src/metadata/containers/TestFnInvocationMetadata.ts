import type { AggregatedIdentifier } from '../ids';
import type { InvocationMetadata } from '../types';
import { BaseMetadata } from './BaseMetadata';
import type { MetadataContext } from './MetadataContext';

import type { TestInvocationMetadata } from './TestInvocationMetadata';

export class TestFnInvocationMetadata extends BaseMetadata implements InvocationMetadata {
  constructor(
    context: MetadataContext,
    public readonly test: TestInvocationMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }

  get definition() {
    return this.test.definition;
  }
}
