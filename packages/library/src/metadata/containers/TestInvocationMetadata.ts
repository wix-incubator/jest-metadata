import type { AggregatedIdentifier } from '../ids';
import * as symbols from '../symbols';

import { BaseMetadata } from './BaseMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestEntryMetadata } from './TestEntryMetadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';

export class TestInvocationMetadata extends BaseMetadata {
  readonly before: HookInvocationMetadata<TestInvocationMetadata>[] = [];
  fn?: TestFnInvocationMetadata;
  readonly after: HookInvocationMetadata<TestInvocationMetadata>[] = [];

  constructor(
    context: MetadataContext,
    public readonly entry: TestEntryMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }

  [symbols.start](): void {
    const id = this[symbols.id].nest('fn');
    const fn = this[symbols.context].factory.createTestFnInvocationMetadata(this, id);
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this.fn = fn;
  }

  [symbols.finish](): void {
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this;
  }
}
