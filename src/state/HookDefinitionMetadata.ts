import { Metadata } from './Metadata';
import { MetadataProperties } from './MetadataProperties';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';

export class HookDefinitionMetadata extends Metadata {
  constructor(properties: MetadataProperties, public readonly owner: DescribeBlockMetadata) {
    super(properties);
  }
}
