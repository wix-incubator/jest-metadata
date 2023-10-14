import { InstanceOfMetadataChecker } from '../checker';
import {
  GlobalMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  BaseMetadata,
  TestFileMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../containers';

import type { MetadataContext } from '../containers';
import { AggregatedIdentifier } from '../ids';
import type { FileMetadataRegistry } from '../registry';
import { MetadataSelectorImpl } from '../selector';
import * as symbols from '../symbols';
import type { HookType, WriteMetadataEventEmitter } from '../types';

import type { MetadataFactory } from './MetadataFactory';

export class MetadataFactoryImpl implements MetadataFactory {
  readonly #checker = new InstanceOfMetadataChecker({
    GlobalMetadata: GlobalMetadata,
    DescribeBlockMetadata,
    HookDefinitionMetadata,
    HookInvocationMetadata,
    TestFileMetadata,
    TestEntryMetadata,
    TestFnInvocationMetadata,
    TestInvocationMetadata,
  });

  readonly #context: MetadataContext;

  constructor(
    private readonly metadataRegistry: FileMetadataRegistry<unknown>,
    private readonly emitter: WriteMetadataEventEmitter,
  ) {
    this.#context = {
      factory: this,
      checker: this.#checker,
      emitter: this.emitter,
      createMetadataSelector: (fn) => new MetadataSelectorImpl(this.#checker, fn),
    };
  }

  get checker() {
    return this.#checker;
  }

  createGlobalMetadata() {
    const id = AggregatedIdentifier.global('globalMetadata');
    return this._register(new GlobalMetadata(this.#context, id));
  }

  createDescribeBlockMetadata(
    parent: TestFileMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ) {
    return this._register(new DescribeBlockMetadata(this.#context, parent, id));
  }

  createHookDefinitionMetadata(
    owner: DescribeBlockMetadata,
    id: AggregatedIdentifier,
    hookType: HookType,
  ) {
    return this._register(new HookDefinitionMetadata(this.#context, owner, id, hookType));
  }

  createHookInvocationMetadata(
    hookDefinition: HookDefinitionMetadata,
    parent: TestInvocationMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ) {
    return this._register(new HookInvocationMetadata(this.#context, hookDefinition, parent, id));
  }

  createTestFileMetadata(testFilePath: string, globalMetadata: GlobalMetadata) {
    const testFileId = new AggregatedIdentifier(testFilePath, '');
    return this._register(new TestFileMetadata(this.#context, testFileId, globalMetadata));
  }

  createTestEntryMetadata(describeBlock: DescribeBlockMetadata, id: AggregatedIdentifier) {
    return this._register(new TestEntryMetadata(this.#context, describeBlock, id));
  }

  createTestFnInvocationMetadata(testInvocation: TestInvocationMetadata, id: AggregatedIdentifier) {
    return this._register(new TestFnInvocationMetadata(this.#context, testInvocation, id));
  }

  createTestInvocationMetadata(testEntry: TestEntryMetadata, id: AggregatedIdentifier) {
    return this._register(new TestInvocationMetadata(this.#context, testEntry, id));
  }

  private _register<T extends BaseMetadata>(metadata: T): T {
    this.metadataRegistry.register(metadata[symbols.id], metadata);
    return metadata;
  }
}
