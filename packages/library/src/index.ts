import funpermaproxy from 'funpermaproxy';

import { realm } from './realms';

export type {
  Metadata,
  AggregatedResultMetadata,
  RunMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  TestEntryMetadata,
  HookInvocationMetadata,
  TestInvocationMetadata,
  TestFnInvocationMetadata,
} from './metadata';

/**
 * Aggregated metadata (global state).
 * Works as intended only in the main process.
 * Child processes will have their own state, limited to their own tests
 */
export const state = realm.aggregatedResultMetadata;

/**
 * Jest Metadata event emitter for advanced use cases.
 * Allows to listen to events emitted by Jest Metadata.
 */
export const events = realm.events;

/**
 * Current metadata of a test block that is being added or executed.
 */
export const metadata = funpermaproxy(() => realm.aggregatedResultMetadata.currentMetadata);

/**
 * Pseudo-annotation that allows to associate metadata with a test block.
 * It is not an ECMAScript decorator, but it behaves similarly.
 * Use it to set a single metadata value.
 */
export const $Set = realm.metadataDSL.$Set;

/**
 * Pseudo-annotation that allows to associate metadata with a test block.
 * It is not an ECMAScript decorator, but it behaves similarly.
 * Use it to push a value to an array in metadata.
 */
export const $Push = realm.metadataDSL.$Push;

/**
 * Pseudo-annotation that allows to associate metadata with a test block.
 * It is not an ECMAScript decorator, but it behaves similarly.
 * Use it to assign multiple values to an object in metadata.
 */
export const $Assign = realm.metadataDSL.$Assign;

/**
 * Pseudo-annotation that allows to associate metadata with a test block.
 * It is not an ECMAScript decorator, but it behaves similarly.
 * Use it to deeply merge multiple values to an object in metadata.
 */
export const $Merge = realm.metadataDSL.$Merge;
