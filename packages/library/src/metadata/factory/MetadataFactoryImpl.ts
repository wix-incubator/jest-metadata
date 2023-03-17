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
  private readonly _checker = new InstanceOfMetadataChecker({
    AggregatedResultMetadata,
    DescribeBlockMetadata,
    HookDefinitionMetadata,
    HookInvocationMetadata,
    RunMetadata,
    TestEntryMetadata,
    TestFnInvocationMetadata,
    TestInvocationMetadata,
  });

  private readonly _context: MetadataContext = {
    factory: this,
    checker: this._checker,
    emitter: this.emitter,
    createMetadataSelector: (fn) => new MetadataSelectorImpl(this._checker, fn),
  };

  constructor(
    private readonly metadataRegistry: MetadataRegistry<unknown>,
    private readonly emitter: SetMetadataEventEmitter,
  ) {}

  get checker() {
    return this._checker;
  }

  createAggregatedResultMetadata() {
    const id = AggregatedIdentifier.global('aggregatedResult');
    return this._register(new AggregatedResultMetadata(this._context, id));
  }

  createDescribeBlockMetadata(
    parent: RunMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ) {
    return this._register(new DescribeBlockMetadata(this._context, parent, id));
  }

  createHookDefinitionMetadata(
    owner: DescribeBlockMetadata,
    id: AggregatedIdentifier,
    hookType: HookType,
  ) {
    return this._register(new HookDefinitionMetadata(this._context, owner, id, hookType));
  }

  createHookInvocationMetadata(
    hookDefinition: HookDefinitionMetadata,
    parent: TestInvocationMetadata | DescribeBlockMetadata,
    id: AggregatedIdentifier,
  ) {
    return this._register(new HookInvocationMetadata(this._context, hookDefinition, parent, id));
  }

  createRunMetadata(testFilePath: string) {
    const runId = new AggregatedIdentifier(testFilePath, '');
    return this._register(new RunMetadata(this._context, runId));
  }

  createTestEntryMetadata(describeBlock: DescribeBlockMetadata, id: AggregatedIdentifier) {
    return this._register(new TestEntryMetadata(this._context, describeBlock, id));
  }

  createTestFnInvocationMetadata(testInvocation: TestInvocationMetadata, id: AggregatedIdentifier) {
    return this._register(new TestFnInvocationMetadata(this._context, testInvocation, id));
  }

  createTestInvocationMetadata(testEntry: TestEntryMetadata, id: AggregatedIdentifier) {
    return this._register(new TestInvocationMetadata(this._context, testEntry, id));
  }

  private _register<T extends BaseMetadata>(metadata: T): T {
    this.metadataRegistry.register(metadata[symbols.id], metadata);
    return metadata;
  }
}
