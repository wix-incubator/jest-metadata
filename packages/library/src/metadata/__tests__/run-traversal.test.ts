import fixtures from '@jest-metadata/fixtures';

import {
  GlobalMetadataRegistry,
  Metadata,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '..';

import { SerialSyncEmitter } from '../../utils';

describe('file metadata traversal:', () => {
  const lastFixtures = Object.values(fixtures).filter(([name]) => {
    return name.startsWith('29.x.x') && name.includes('-worker-N');
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

    const lastRun = globalMetadata.lastTestFile!;
    if (!lastRun) {
      return;
    }

    const toId = (x: Metadata) => {
      const [a, b] = x.id.split(':');
      return b || a;
    };

    const toChain = (x: Iterable<Metadata>) => [...x].map(toId).join(' → ');

    expect(toChain([...lastRun.allDescribeBlocks()])).toMatchSnapshot('allDescribeBlocks');
    expect(toChain([...lastRun.allTestEntries()])).toMatchSnapshot('allTestEntries');
    expect(toChain([...lastRun.allTestInvocations()])).toMatchSnapshot('allTestInvocations');
    expect(toChain([...lastRun.allInvocations()])).toMatchSnapshot('allInvocations');

    for (const test of lastRun.allTestEntries()) {
      expect(toChain(test.allAncestors())).toMatchSnapshot(`allAncestors ${toId(test)}`);
    }

    for (const invocation of lastRun.allTestInvocations()) {
      expect(toChain(invocation.allAncestors())).toMatchSnapshot(
        `allAncestors ${toId(invocation)}`,
      );
      expect(toChain(invocation.invocations())).toMatchSnapshot(`invocations ${toId(invocation)}`);
      expect(toChain(invocation.allInvocations())).toMatchSnapshot(
        `allInvocations ${toId(invocation)}`,
      );
    }

    const haveRun = [
      ...lastRun.allTestEntries(),
      ...lastRun.allTestInvocations(),
      ...lastRun.allDescribeBlocks(),
    ];

    for (const meta of haveRun) {
      expect(meta.file).toBe(lastRun);
    }
  });
});
