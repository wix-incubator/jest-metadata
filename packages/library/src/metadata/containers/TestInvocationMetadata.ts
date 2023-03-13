import type { AggregatedIdentifier, MetadataContext } from '../misc';
import * as symbols from '../symbols';

import { Metadata } from './Metadata';
import type { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import type { HookInvocationMetadata } from './HookInvocationMetadata';
import type { TestEntryMetadata } from './TestEntryMetadata';

export class TestInvocationMetadata extends Metadata {
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
