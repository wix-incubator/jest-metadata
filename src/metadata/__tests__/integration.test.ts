import fixtures from '../../../e2e';

import { SerialEmitter } from '../../utils';
import { PlantSerializer } from '../__utils__';
import {
  GlobalMetadataRegistry,
  MetadataEventHandler,
  MetadataFactoryImpl,
  WriteMetadataEventEmitter,
} from '../index';

describe('metadata - integration test:', () => {
  test.each(Object.values(fixtures.metadata))(
    `e2e/__fixtures__/%s`,
    (_name: string, fixture: any[]) => {
      const emitter: WriteMetadataEventEmitter = new SerialEmitter('set');
      const metadataRegistry = new GlobalMetadataRegistry();
      const metadataFactory = new MetadataFactoryImpl(metadataRegistry, emitter);
      const globalMetadata = metadataFactory.createGlobalMetadata();
      const eventHandler = new MetadataEventHandler({
        globalMetadata,
        metadataRegistry,
      });

      const serialized = () => PlantSerializer.serialize(metadataFactory.checker, metadataRegistry);

      for (const event of fixture) {
        eventHandler.handle(event);
      }

      expect(serialized()).toMatchSnapshot();
    },
  );
});
