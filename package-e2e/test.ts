import { $Set, $Push, $Merge, $Assign, $Unshift, state, metadata } from 'jest-metadata';
import { events } from 'jest-metadata/debug';
import type { GlobalMetadata, Metadata } from 'jest-metadata';
import JestMetadataReporter from 'jest-metadata/reporter';
import JsdomTestEnvironment from 'jest-metadata/environment-jsdom';
import NodeTestEnvironment from 'jest-metadata/environment-node';
import environmentListener from 'jest-metadata/environment-listener';

function assertType<T>(_actual: T): void {
  // no-op
}

assertType<GlobalMetadata>(state);
assertType<Metadata>(metadata);
assertType<Function>($Set);
assertType<Function>($Push);
assertType<Function>($Merge);
assertType<Function>($Assign);
assertType<Function>($Unshift);

assertType<object>(events);

assertType<Function>(JestMetadataReporter);
assertType<Function>(JestMetadataReporter.query.globalMetadata);
assertType<Function>(JestMetadataReporter.query.test);
assertType<Function>(JestMetadataReporter.query.filePath);
assertType<Function>(JestMetadataReporter.query.testResult);
assertType<Function>(JestMetadataReporter.query.testCaseResult);

assertType<Function>(JsdomTestEnvironment);

assertType<Function>(NodeTestEnvironment);

assertType<Function>(environmentListener);
