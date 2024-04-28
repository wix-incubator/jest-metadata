import type { Metadata } from '../../metadata';
import { PlantObject } from './PlantObject';

const COLORS: Record<string, string> = {
  GlobalMetadata: '#dff',
  TestFileMetadata: '#def',
  DescribeBlockMetadata: '#ded',
  HookDefinitionMetadata: '#fdd',
  HookInvocationMetadata: '#fcb',
  TestEntryMetadata: '#ffd',
  TestInvocationMetadata: '#ffb',
  TestFnInvocationMetadata: '#fea',
};

export class MetadataPlantObject extends PlantObject {
  constructor(metadata: Metadata) {
    const name = Object.getPrototypeOf(metadata).constructor.name;
    super({
      id: metadata.id,
      name,
      color: COLORS[name],
      properties: getProperties(metadata),
    });
  }
}

function getProperties(metadata: Metadata): Record<string, unknown> {
  const [fileId, childId] = metadata.id.split(':');
  const result: Record<string, unknown> = {
    id: childId || fileId,
    data: metadata.get(),
  };

  if (!result.id) {
    delete result.id;
  }

  if (!result.data || Object.keys(result.data).length === 0) {
    delete result.data;
  }

  return result;
}
