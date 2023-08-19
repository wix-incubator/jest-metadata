import fixtures from '@jest-metadata/fixtures';

import {
  AggregatedMetadataRegistry,
  Metadata,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '..';

import { SerialSyncEmitter } from '../../utils';

describe('run metadata traversal:', () => {
  const lastFixtures = Object.values(fixtures).filter(([name]) => {
    return name.startsWith('29.x.x') && name.includes('-worker-N');
  });

  test.each(lastFixtures)(`fixtures/%s`, (_name: string, fixture: any[]) => {
    const emitter: SetMetadataEventEmitter = new SerialSyncEmitter('set');
    const metadataRegistry = new AggregatedMetadataRegistry();
    const metadataFactory = new MetadataFactoryImpl(metadataRegistry, emitter);
    const aggregatedResultMetadata = metadataFactory.createAggregatedResultMetadata();
    const eventHandler = new MetadataEventHandler({
      aggregatedResultMetadata,
      metadataRegistry,
    });

    for (const event of fixture) {
      eventHandler.handle(event);
    }

    const lastRun = aggregatedResultMetadata.lastTestResult!;
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
  });
});
