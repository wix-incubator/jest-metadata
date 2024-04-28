import { $Set, $Push, $Merge, $Assign, $Defaults, $Unshift, state, metadata } from 'jest-metadata';
import { events, metadataRegistryEvents, visualize } from 'jest-metadata/debug';
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

$Set('path', 'value' as unknown);
$Set(['path'], 'value' as unknown);

$Push('path', -1, '2', true);
$Push(['path'], -1, '2', true);

$Unshift('path', -1, '2', true);
$Unshift(['path'], -1, '2', true);

$Merge('path', { key: 'value' });
$Merge(['path'], { key: 'value' });

$Assign('path', { key: 'value' });
$Assign(['path'], { key: 'value' });

$Defaults('path', { key: 'value' });
$Defaults(['path'], { key: 'value' });

assertType<object>(events);
events.on('setup', (e) => assertType<string>(e.type));
events.on('add_hook', (e) => assertType<string>(e.type));
events.on('add_test', (e) => assertType<string>(e.type));
events.on('finish_describe_definition', (e) => assertType<string>(e.type));
events.on('hook_failure', (e) => assertType<string>(e.type));
events.on('hook_start', (e) => assertType<string>(e.type));
events.on('hook_success', (e) => assertType<string>(e.type));
events.on('run_describe_finish', (e) => assertType<string>(e.type));
events.on('run_describe_start', (e) => assertType<string>(e.type));
events.on('run_finish', (e) => assertType<string>(e.type));
events.on('run_start', (e) => assertType<string>(e.type));
events.on('write_metadata', (e) => assertType<string>(e.type));
events.on('start_describe_definition', (e) => assertType<string>(e.type));
events.on('test_done', (e) => assertType<string>(e.type));
events.on('add_test_file', (e) => assertType<string>(e.type));
events.on('test_fn_failure', (e) => assertType<string>(e.type));
events.on('test_fn_start', (e) => assertType<string>(e.type));
events.on('test_fn_success', (e) => assertType<string>(e.type));
events.on('test_retry', (e) => assertType<string>(e.type));
events.on('test_skip', (e) => assertType<string>(e.type));
events.on('test_start', (e) => assertType<string>(e.type));
events.on('test_started', (e) => assertType<string>(e.type));
events.on('test_todo', (e) => assertType<string>(e.type));

metadataRegistryEvents.on('register_metadata', (e) => {
  assertType<'register_metadata'>(e.type);
  assertType<unknown>(e.metadata.get());
});

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

assertType<Function>(() => {
  assertType<Promise<string>>(visualize('/path/to/bunyamin.log'));
  assertType<Promise<string>>(visualize([{ type: 'setup', testFilePath: 'test.ts' }]));
});
