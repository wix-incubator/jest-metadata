import type {
  GlobalMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  Metadata,
  MetadataChecker,
  TestFileMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../metadata';

export abstract class MetadataVisitor {
  constructor(protected readonly checker: MetadataChecker) {}

  visit(metadata: Metadata): void {
    if (this.checker.isGlobalMetadata(metadata)) {
      this.visitGlobal(metadata);
    } else if (this.checker.isTestFileMetadata(metadata)) {
      this.visitTestFile(metadata);
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

  protected abstract visitGlobal(metadata: GlobalMetadata): void;
  protected abstract visitTestFile(metadata: TestFileMetadata): void;
  protected abstract visitDescribeBlock(metadata: DescribeBlockMetadata): void;
  protected abstract visitHookDefinition(metadata: HookDefinitionMetadata): void;
  protected abstract visitTestEntry(metadata: TestEntryMetadata): void;
  protected abstract visitHookInvocation(metadata: HookInvocationMetadata): void;
  protected abstract visitTestInvocation(metadata: TestInvocationMetadata): void;
  protected abstract visitTestFnInvocation(metadata: TestFnInvocationMetadata): void;
}
