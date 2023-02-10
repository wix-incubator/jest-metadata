import { ContextAPI } from '../circus/types';

import { Metadata } from './Metadata';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { TestFnInvocationMetadata } from './TestFnInvocationMetadata';
import { TestEntryMetadata } from './TestEntryMetadata';

export class TestInvocationMetadata extends Metadata {
  readonly beforeHooks: HookInvocationMetadata[] = [];
  testFn?: TestFnInvocationMetadata;
  readonly afterHooks: HookInvocationMetadata[] = [];

  constructor(api: ContextAPI, public readonly testEntry: TestEntryMetadata) {
    super(api);
  }
}
