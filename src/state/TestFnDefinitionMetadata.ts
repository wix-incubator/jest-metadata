import { Metadata } from './Metadata';
import { MetadataProperties } from './MetadataProperties';
import { TestEntryMetadata } from './TestEntryMetadata';

export class TestFnDefinitionMetadata extends Metadata {
  constructor(properties: MetadataProperties, public readonly owner: TestEntryMetadata) {
    super(properties);
  }
}
