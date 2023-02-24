import { Metadata } from './Metadata';
import { MetadataProperties } from './MetadataProperties';
import { TestFnDefinitionMetadata } from './TestFnDefinitionMetadata';

export class TestFnInvocationMetadata extends Metadata {
  constructor(
    properties: MetadataProperties,
    public readonly definition: TestFnDefinitionMetadata,
  ) {
    super(properties);
  }
}
