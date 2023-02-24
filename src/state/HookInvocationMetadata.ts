import { HookDefinitionMetadata } from './HookDefinitionMetadata';
import { Metadata } from './Metadata';
import { MetadataProperties } from './MetadataProperties';

export class HookInvocationMetadata extends Metadata {
  constructor(properties: MetadataProperties, public readonly definition: HookDefinitionMetadata) {
    super(properties);
  }
}
