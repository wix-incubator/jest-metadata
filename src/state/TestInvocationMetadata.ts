import { HookInvocationMetadata } from './HookInvocationMetadata';
import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { ScopedIdentifier } from './ScopedIdentifier';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import * as symbols from './symbols';

export class TestInvocationMetadata extends Metadata {
  readonly before: HookInvocationMetadata<TestInvocationMetadata>[] = [];
  fn?: TestFnInvocationMetadata;
  readonly after: HookInvocationMetadata<TestInvocationMetadata>[] = [];

  constructor(
    context: MetadataContext,
    public readonly entry: TestEntryMetadata,
    id: ScopedIdentifier,
  ) {
    super(context, id);
  }

  [symbols.start](): void {
    const fn = new TestFnInvocationMetadata(this.context, this, this.id.nest('fn'));
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this.fn = fn;
  }

  [symbols.finish](): void {
    const run = this.entry.describeBlock.run;
    run[symbols.currentMetadata] = this;
  }
}
