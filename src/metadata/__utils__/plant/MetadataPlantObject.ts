import { isEmpty, omitBy } from 'lodash';

import type { Metadata } from '../../index';
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
      properties: omitBy(
        {
          id: metadata.id.split(':').pop(),
          data: metadata.get(),
        },
        isEmpty,
      ),
    });
  }
}
