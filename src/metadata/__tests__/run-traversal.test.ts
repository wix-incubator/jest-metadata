import fixtures from '../../../e2e';

import { SerialSyncEmitter } from '../../utils';
import {
  GlobalMetadataRegistry,
  Metadata,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '../index';

describe('file metadata traversal:', () => {
  const lastFixtures = Object.values(fixtures.metadata).filter(([name]) => {
    return name.startsWith('29.x.x') && name.includes('env-N') && !name.includes('no-env');
  });

  test.each(lastFixtures)(`fixtures/%s`, (_name: string, fixture: any[]) => {
    const emitter: SetMetadataEventEmitter = new SerialSyncEmitter('set');
    const metadataRegistry = new GlobalMetadataRegistry();
    const metadataFactory = new MetadataFactoryImpl(metadataRegistry, emitter);
    const globalMetadata = metadataFactory.createGlobalMetadata();
    const eventHandler = new MetadataEventHandler({
      globalMetadata,
      metadataRegistry,
    });

    for (const event of fixture) {
      eventHandler.handle(event);
    }

    const lastFile = globalMetadata.lastTestFile!;
    if (!lastFile) {
      return;
    }

    const toId = (x: Metadata) => {
      const [a, b] = x.id.split(':');
      return b || a;
    };

    const toChain = (x: Iterable<Metadata>) => [...x].map(toId).join(' → ');

    expect(toChain([...lastFile.allDescribeBlocks()])).toMatchSnapshot('allDescribeBlocks');
    expect(toChain([...lastFile.allTestEntries()])).toMatchSnapshot('allTestEntries');
    expect(toChain([...lastFile.allTestInvocations()])).toMatchSnapshot('allTestInvocations');
    expect(toChain([...lastFile.allInvocations()])).toMatchSnapshot('allInvocations');

    for (const test of lastFile.allTestEntries()) {
      expect(toChain(test.allAncestors())).toMatchSnapshot(`allAncestors ${toId(test)}`);
    }

    for (const invocation of lastFile.allTestInvocations()) {
      expect(toChain(invocation.allAncestors())).toMatchSnapshot(
        `allAncestors ${toId(invocation)}`,
      );
      expect(toChain(invocation.invocations())).toMatchSnapshot(`invocations ${toId(invocation)}`);
      expect(toChain(invocation.allInvocations())).toMatchSnapshot(
        `allInvocations ${toId(invocation)}`,
      );
    }

    const haveRun = [
      ...lastFile.allTestEntries(),
      ...lastFile.allTestInvocations(),
      ...lastFile.allDescribeBlocks(),
    ];

    for (const meta of haveRun) {
      expect(meta.file).toBe(lastFile);
    }
  });
});
