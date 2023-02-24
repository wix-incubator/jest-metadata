import { Metadata } from './Metadata';
import { MetadataProperties } from './MetadataProperties';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import { TestEntryMetadata } from './TestEntryMetadata';

export class TestInvocationMetadata extends Metadata {
  readonly beforeHooks: HookInvocationMetadata[] = [];
  testFn?: TestFnInvocationMetadata;
  readonly afterHooks: HookInvocationMetadata[] = [];

  constructor(properties: MetadataProperties, public readonly testEntry: TestEntryMetadata) {
    super(properties);
  }
}
