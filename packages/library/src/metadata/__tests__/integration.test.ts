import fixtures from '@jest-metadata/fixtures';

import { AggregatedMetadataRegistry, MetadataEventHandler, MetadataEventEmitter } from '..';

describe('metadata: integration test', () => {
  test.each(Object.values(fixtures))(`should not crash on: %s`, (_name: string, fixture: any[]) => {
    const aggregatedMetadataRegistry = new AggregatedMetadataRegistry();
    const emitter = new MetadataEventEmitter();
    const eventHandler = new MetadataEventHandler({
      aggregatedMetadataRegistry,
      emitter,
    });

    for (const event of fixture) {
      eventHandler.handle(event);
    }
  });
});
