import type {
  AggregatedResultMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  Metadata,
  MetadataChecker,
  RunMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../index';

export abstract class MetadataVisitor {
  constructor(protected readonly checker: MetadataChecker) {}

  visit(metadata: Metadata): void {
    if (this.checker.isAggregatedResultMetadata(metadata)) {
      this.visitAggregatedResult(metadata);
    } else if (this.checker.isRunMetadata(metadata)) {
      this.visitRun(metadata);
    } else if (this.checker.isDescribeBlockMetadata(metadata)) {
      this.visitDescribeBlock(metadata);
    } else if (this.checker.isHookDefinitionMetadata(metadata)) {
      this.visitHookDefinition(metadata);
    } else if (this.checker.isTestEntryMetadata(metadata)) {
      this.visitTestEntry(metadata);
    } else if (this.checker.isHookInvocationMetadata(metadata)) {
      this.visitHookInvocation(metadata);
    } else if (this.checker.isTestInvocationMetadata(metadata)) {
      this.visitTestInvocation(metadata);
    } else if (this.checker.isTestFnInvocationMetadata(metadata)) {
      this.visitTestFnInvocation(metadata);
    } else {
      throw new TypeError(`Unknown metadata type: ${metadata.constructor.name}`);
    }
  }

  protected abstract visitAggregatedResult(metadata: AggregatedResultMetadata): void;
  protected abstract visitRun(metadata: RunMetadata): void;
  protected abstract visitDescribeBlock(metadata: DescribeBlockMetadata): void;
  protected abstract visitHookDefinition(metadata: HookDefinitionMetadata): void;
  protected abstract visitTestEntry(metadata: TestEntryMetadata): void;
  protected abstract visitHookInvocation(metadata: HookInvocationMetadata): void;
  protected abstract visitTestInvocation(metadata: TestInvocationMetadata): void;
  protected abstract visitTestFnInvocation(metadata: TestFnInvocationMetadata): void;
}
