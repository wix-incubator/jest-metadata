import { HookInvocationMetadata } from './HookInvocationMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export type InvocationMetadata = TestInvocationMetadata | HookInvocationMetadata;
