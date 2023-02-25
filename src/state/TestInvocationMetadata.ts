import { Metadata } from './Metadata';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { TestFnInvocationMetadata } from './TestFnInvocationMetadata';

export class TestInvocationMetadata extends Metadata {
  readonly beforeHooks: HookInvocationMetadata[] = [];
  testFn?: TestFnInvocationMetadata;
  readonly afterHooks: HookInvocationMetadata[] = [];
}
