import fixtures from '@jest-metadata/fixtures';

import {
  AggregatedMetadataRegistry,
  Metadata,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '..';

import { Squasher } from '../../jest-reporter';
import { SerialSyncEmitter } from '../../utils';

describe('squash - integration test:', () => {
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

    const squasher = new Squasher(aggregatedResultMetadata);
    const lastRun = aggregatedResultMetadata.lastTestResult!;
    if (!lastRun) {
      return;
    }

    const toId = (x: Metadata) => {
      const [a, b] = x.id.split(':');
      return b || a;
    };

    const toChain = (x: Metadata[]) => x.map(toId).join(' → ');

    for (const block of lastRun.allDescribeBlocks()) {
      expect(toChain(squasher.describeBlock(block))).toMatchSnapshot(toId(block));
    }

    for (const test of lastRun.allTestEntries()) {
      expect(toChain(squasher.testEntry(test))).toMatchSnapshot(toId(test));
    }

    expect(toChain([...lastRun.allTestInvocations()])).toMatchSnapshot('allTestInvocations');
    expect(toChain([...lastRun.allInvocations()])).toMatchSnapshot('allInvocations');

    for (const invocation of lastRun.allTestInvocations()) {
      expect(toChain(squasher.testInvocation(invocation))).toMatchSnapshot(toId(invocation));
      expect(toChain(squasher.testInvocationAll(invocation))).toMatchSnapshot(
        `*${toId(invocation)}`,
      );
    }
  });
});
