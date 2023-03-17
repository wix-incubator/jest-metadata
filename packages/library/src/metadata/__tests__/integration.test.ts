import fixtures from '@jest-metadata/fixtures';

import {
  AggregatedMetadataRegistry,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '..';

import { PlantSerializer } from '../../__utils__';
import { SerialEmitter } from '../../utils';

describe('metadata: integration test', () => {
  test.each(Object.values(fixtures))(`should create state: %s`, (_name: string, fixture: any[]) => {
    const emitter: SetMetadataEventEmitter = new SerialEmitter();
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
