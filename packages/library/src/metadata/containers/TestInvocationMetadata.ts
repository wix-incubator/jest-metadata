import { AggregatedIdentifier, MetadataContext } from '../misc';
import * as symbols from '../symbols';

import { HookInvocationMetadata } from './HookInvocationMetadata';
import { Metadata } from './Metadata';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestFnInvocationMetadata } from './TestFnInvocationMetadata';

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
    const fn = new TestFnInvocationMetadata(this[symbols.context], this, id);
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this.fn = fn;
  }

  [symbols.finish](): void {
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this;
  }
}
