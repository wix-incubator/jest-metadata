import type {
  GlobalMetadata,
  DescribeBlockMetadata,
  HookDefinitionMetadata,
  HookInvocationMetadata,
  Metadata,
  TestFileMetadata,
  TestEntryMetadata,
  TestFnInvocationMetadata,
  TestInvocationMetadata,
} from '../../metadata';
import { MetadataVisitor } from '../MetadataVisitor';
import { MetadataPlantObject } from './MetadataPlantObject';
import { PlantLink } from './PlantLink';
import type { PlantObject } from './PlantObject';

export class PlantMetadataVisitor extends MetadataVisitor {
  protected readonly objects: PlantObject[] = [];
  protected readonly links: PlantLink[] = [];

  public generatePlantUML(): string {
    const header = '@startuml\n\n';
    const footer = '\n@enduml\n';
    const objectsSection = this.objects.map((o) => o.toString()).join('\n') + '\n';
    const linksSection = this.links.map((l) => l.toString()).join('\n') + '\n';

    return header + objectsSection + linksSection + footer;
  }

  public visit(metadata: Metadata) {
    this.objects.push(new MetadataPlantObject(metadata));
    super.visit(metadata);
  }

  protected visitGlobal(metadata: GlobalMetadata): void {
    this._registerLink(metadata, 'testFiles');
  }

  protected visitDescribeBlock(metadata: DescribeBlockMetadata): void {
    this._registerLink(metadata, 'children');
  }

  protected visitHookDefinition(metadata: HookDefinitionMetadata): void {
    const plantObject = this.objects[this.objects.length - 1];
    plantObject!.properties.hookType = metadata.hookType;

    this._registerLink(metadata, 'invocations');
  }

  protected visitHookInvocation(_metadata: HookInvocationMetadata): void {
    // Do nothing
    // this._registerLink(metadata, 'definition');
    // this._registerLink(metadata, 'parent');
  }

  protected visitTestFile(metadata: TestFileMetadata): void {
    this._registerLink(metadata, 'rootDescribeBlock');
  }

  protected visitTestEntry(metadata: TestEntryMetadata): void {
    this._registerLink(metadata, 'invocations');
  }

  protected visitTestFnInvocation(metadata: TestFnInvocationMetadata): void {
    this._registerLink(metadata, 'test');
  }

  protected visitTestInvocation(metadata: TestInvocationMetadata): void {
    this._registerLink(metadata, 'beforeAll');
    this._registerLink(metadata, 'beforeEach');
    this._registerLink(metadata, 'fn');
    this._registerLink(metadata, 'afterEach');
    this._registerLink(metadata, 'afterAll');
  }

  private _registerLink<T extends Metadata>(metadata: T, key: keyof T & string): void {
    const value: any = metadata[key];

    if (typeof value?.id === 'string') {
      this.links.push(new PlantLink(metadata.id, value.id, key));
    }

    if (typeof value?.entries === 'function') {
      for (const [i, element] of value.entries()) {
        if (typeof element?.id === 'string') {
          this.links.push(new PlantLink(metadata.id, element.id, `${key}[${i}]`));
        }
      }
    }
  }
}
