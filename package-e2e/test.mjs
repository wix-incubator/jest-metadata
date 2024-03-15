import assert from 'assert';
import { $Set, $Push, $Merge, $Assign, $Defaults, $Unshift, state, metadata } from 'jest-metadata';
import { events, metadataRegistryEvents } from 'jest-metadata/debug';
import JsdomTestEnvironment from 'jest-metadata/environment-jsdom';
import NodeTestEnvironment from 'jest-metadata/environment-node';
import environmentListener from 'jest-metadata/environment-listener';
import JestMetadataReporter, { query, JestMetadataReporter as JestMetadataReporterNamed } from 'jest-metadata/reporter';

assert(typeof metadata === 'object', 'jest-metadata should export `metadata` object');
assert(typeof state === 'object', 'jest-metadata should export `state` object');
assert(typeof $Set === 'function', 'jest-metadata should export `$Set` function as a named export');
assert(typeof $Push === 'function', 'jest-metadata should export `$Push` function as a named export');
assert(typeof $Merge === 'function', 'jest-metadata should export `$Merge` function as a named export');
assert(typeof $Assign === 'function', 'jest-metadata should export `$Assign` function as a named export');
assert(typeof $Defaults === 'function', 'jest-metadata should export `$Defaults` function as a named export');
assert(typeof $Unshift === 'function', 'jest-metadata should export `$Unshift` function as a named export');

assert(typeof events === 'object', 'jest-metadata/debug should export `events` object');
assert(typeof metadataRegistryEvents === 'object', 'jest-metadata/debug should export `metadataRegistryEvents` object');

assert(typeof environmentListener === 'function', 'jest-metadata/environment-listener should export a function as its default export');

assert(isClass(JsdomTestEnvironment), 'jest-metadata/environment-jsdom should export a class as its default export');

assert(isClass(NodeTestEnvironment), 'jest-metadata/environment-node should export a class as its default export');

assert(isClass(JestMetadataReporter), 'jest-metadata/reporter should export a class as its default export');
assert(isClass(JestMetadataReporterNamed), 'jest-metadata/reporter should export `JestMetadataReporter` class as a named export');
assert(typeof query === 'object', 'jest-metadata/reporter should export query helper');
assert(query === JestMetadataReporter.query, 'jest-metadata/reporter class should have query helper as a static property');

function isClass(obj) {
  return typeof obj === 'function' && /^class\s/.test(Function.prototype.toString.call(obj));
}
