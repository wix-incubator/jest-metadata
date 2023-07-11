import { InstanceOfMetadataChecker } from '../checker';
import {
  AggregatedResultMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  BaseMetadata,
  RunMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../containers';

import type { MetadataContext } from '../containers';
import { AggregatedIdentifier } from '../ids';
import type { MetadataRegistry } from '../registry';
import { MetadataSelectorImpl } from '../selector';
import * as symbols from '../symbols';
import type { HookType, SetMetadataEventEmitter } from '../types';

import type { MetadataFactory } from './MetadataFactory';

export class MetadataFactoryImpl implements MetadataFactory {
  readonly #checker = new InstanceOfMetadataChecker({
    AggregatedResultMetadata,
    DescribeBlockMetadata,
    HookDefinitionMetadata,
    HookInvocationMetadata,
    RunMetadata,
    TestEntryMetadata,
    TestFnInvocationMetadata,
    TestInvocationMetadata,
  });

  readonly #context: MetadataContext;

  constructor(
    private readonly metadataRegistry: MetadataRegistry<unknown>,
    private readonly emitter: SetMetadataEventEmitter,
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

  createAggregatedResultMetadata() {
    const id = AggregatedIdentifier.global('aggregatedResult');
    return this._register(new AggregatedResultMetadata(this.#context, id));
  }

  createDescribeBlockMetadata(
    parent: RunMetadata | DescribeBlockMetadata,
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

  createRunMetadata(testFilePath: string) {
    const runId = new AggregatedIdentifier(testFilePath, '');
    return this._register(new RunMetadata(this.#context, runId));
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
