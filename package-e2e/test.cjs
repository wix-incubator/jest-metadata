const assert = require('assert');

const { metadata, state, $Set, $Push, $Merge, $Assign, $Defaults, $Unshift } = require('jest-metadata');
assert(typeof metadata === 'object', 'jest-metadata should export `metadata` object');
assert(typeof state === 'object', 'jest-metadata should export `state` object');
assert(typeof $Set === 'function', 'jest-metadata should export $Set function as a named export');
assert(typeof $Push === 'function', 'jest-metadata should export $Push function as a named export');
assert(typeof $Merge === 'function', 'jest-metadata should export $Merge function as a named export');
assert(typeof $Assign === 'function', 'jest-metadata should export $Assign function as a named export');
assert(typeof $Defaults === 'function', 'jest-metadata should export $Defaults function as a named export');
assert(typeof $Unshift === 'function', 'jest-metadata should export $Unshift function as a named export');

const { events } = require('jest-metadata/debug');
assert(typeof events === 'object', 'jest-metadata/debug should export `events` object');

const environmentListener = require('jest-metadata/environment-listener');
assert(typeof environmentListener === 'function', 'jest-metadata/environment-listener should export a class as its default export');

const JsdomTestEnvironment = require('jest-metadata/environment-jsdom');
assert(isClass(JsdomTestEnvironment), 'jest-metadata/environment-jsdom should export a class as its default export');

const NodeTestEnvironment = require('jest-metadata/environment-node');
assert(isClass(NodeTestEnvironment), 'jest-metadata/environment-node should export a class as its default export');

const JestMetadataReporter = require('jest-metadata/reporter');
assert(isClass(JestMetadataReporter), 'jest-metadata/reporter should export a class as its default export');
assert(JestMetadataReporter.JestMetadataReporter, 'jest-metadata/reporter should export `JestMetadataReporter` class as a named export');
assert(typeof JestMetadataReporter.query === 'object', 'jest-metadata/reporter should export query helper');

function isClass(obj) {
  return typeof obj === 'function' && /^class\s/.test(Function.prototype.toString.call(obj));
}
