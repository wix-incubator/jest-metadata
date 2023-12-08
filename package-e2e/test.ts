import { $Set, $Push, $Merge, $Assign, $Unshift, state, metadata } from 'jest-metadata';
import { events } from 'jest-metadata/debug';
import type { GlobalMetadata, Metadata } from 'jest-metadata';
import JestMetadataReporter, { query, JestMetadataReporter as JestMetadataReporterNamed } from 'jest-metadata/reporter';
import JsdomTestEnvironment from 'jest-metadata/environment-jsdom';
import NodeTestEnvironment from 'jest-metadata/environment-node';
import environmentListener from 'jest-metadata/environment-listener';

function assertType<T>(_actual: T, _other?: T): void {
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

assertType<Function>(JestMetadataReporter, JestMetadataReporterNamed);
assertType<object>(JestMetadataReporter.query, query);
assertType<Function>(query.globalMetadata);
assertType<Function>(query.test);
assertType<Function>(query.filePath);
assertType<Function>(query.testResult);
assertType<Function>(query.testCaseResult);

assertType<Function>(JsdomTestEnvironment);

assertType<Function>(NodeTestEnvironment);

assertType<Function>(environmentListener);
