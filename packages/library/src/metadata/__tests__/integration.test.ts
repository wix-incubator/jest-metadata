import fixtures from '@jest-metadata/fixtures';

import {
  AggregatedMetadataRegistry,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '..';

import { SerialSyncEmitter } from '../../utils';
import { PlantSerializer } from '../__utils__';

describe('metadata - integration test:', () => {
  test.each(Object.values(fixtures))(`fixtures/%s`, (_name: string, fixture: any[]) => {
    const emitter: SetMetadataEventEmitter = new SerialSyncEmitter('set');
    const metadataRegistry = new AggregatedMetadataRegistry();
    const metadataFactory = new MetadataFactoryImpl(metadataRegistry, emitter);
    const aggregatedResultMetadata = metadataFactory.createAggregatedResultMetadata();
    const eventHandler = new MetadataEventHandler({
      aggregatedResultMetadata,
      metadataRegistry,
    });

    const serialized = () => PlantSerializer.serialize(metadataFactory.checker, metadataRegistry);

    for (const event of fixture) {
      eventHandler.handle(event);
    }

    expect(serialized()).toMatchSnapshot();
  });
});
