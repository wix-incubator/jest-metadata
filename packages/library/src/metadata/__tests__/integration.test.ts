import fixtures from '@jest-metadata/fixtures';

import {
  AggregatedMetadataRegistry,
  MetadataEventHandler,
  MetadataFactory,
  SetMetadataEventEmitter,
} from '..';
import { SerialEmitter } from '../../utils';

describe('metadata: integration test', () => {
  test.each(Object.values(fixtures))(`should not crash on: %s`, (_name: string, fixture: any[]) => {
    const emitter: SetMetadataEventEmitter = new SerialEmitter();
    const metadataRegistry = new AggregatedMetadataRegistry();
    const metadataFactory = new MetadataFactory(metadataRegistry, emitter);
    const eventHandler = new MetadataEventHandler({
      metadataRegistry,
      metadataFactory,
    });

    for (const event of fixture) {
      eventHandler.handle(event);
    }
  });
});
