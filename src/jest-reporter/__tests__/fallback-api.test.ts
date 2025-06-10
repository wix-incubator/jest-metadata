import { describe, jest, test, expect, beforeEach } from '@jest/globals';
import fixtures from '../../../e2e';
import type { IPCServer } from '../../ipc';
import {
  GlobalMetadataRegistry,
  MetadataEvent,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactoryImpl,
  WriteMetadataEventEmitter,
} from '../../metadata';
import { SerialEmitter } from '../../utils';
import { AssociateMetadata } from '../AssociateMetadata';
import { FallbackAPI } from '../FallbackAPI';
import { QueryMetadata } from '../QueryMetadata';
import { ReporterServer } from '../ReporterServer';

describe('Fallback API', () => {
  let server: ReporterServer;
  let query: QueryMetadata;
  let metadataHandler: MetadataEventHandler;

  beforeEach(() => {
    const IPCServer = jest.requireMock<any>('../../ipc').IPCServer;
    const ipc: jest.Mocked<IPCServer> = new IPCServer();

    const emitter = new SerialEmitter<MetadataEvent>('core').on('*', (event: MetadataEvent) => {
      metadataHandler.handle(event);
    }) as MetadataEventEmitter;
    const setEmitter = new SerialEmitter('set') as WriteMetadataEventEmitter;
    const metadataRegistry = new GlobalMetadataRegistry();
    const metadataFactory = new MetadataFactoryImpl(metadataRegistry, setEmitter);
    const globalMetadata = metadataFactory.createGlobalMetadata();
    metadataHandler = new MetadataEventHandler({
      globalMetadata,
      metadataRegistry,
    });
    jest.spyOn(metadataHandler, 'handle');
    const associate = new AssociateMetadata();
    query = new QueryMetadata(associate, metadataFactory.checker);
    const fallbackAPI = new FallbackAPI(globalMetadata, emitter);
    server = new ReporterServer({
      associate,
      rootDir: process.cwd(),
      fallbackAPI,
      ipc,
    });
  });

  // TODO: Add tests
  test.each(Object.values(fixtures.reporter))(
    `e2e/__fixtures__/%s`,
    async (_name: string, fixture: any[]) => {
      const acc: string[] = [];
      for (const event of fixture) {
        await processEvent(event);
        await verifyEvent(acc, event);
      }

      const handle = metadataHandler.handle as jest.MockedFunction<any>;
      expect(handle.mock.calls.map((args: any[]) => args[0])).toMatchSnapshot('emitted events');
      expect(acc).toMatchSnapshot('metadata ids');
    },
  );

  function processEvent(event: any) {
    switch (event.type) {
      case 'reporter:onRunStart': {
        return server.onRunStart();
      }
      case 'reporter:onTestFileStart': {
        return server.onTestFileStart(event.testFilePath);
      }
      case 'reporter:onTestCaseResult': {
        return server.onTestCaseResult(event.testFilePath, event.testCaseResult);
      }
      case 'reporter:onTestFileResult': {
        return server.onTestFileResult(event.testFilePath, event.testResult);
      }
      case 'reporter:onRunComplete': {
        return server.onRunComplete();
      }
    }
  }

  function verifyEvent(acc: string[], event: any) {
    switch (event.type) {
      case 'reporter:onTestFileStart': {
        acc.push(query.filePath(event.testFilePath).id);
        break;
      }
      case 'reporter:onTestCaseResult': {
        acc.push(query.testCaseResult(event.testCaseResult).id);
        break;
      }
      case 'reporter:onTestFileResult': {
        acc.push(query.testResult(event.testResult).id);
        for (const testCaseResult of event.testResult.testResults) {
          acc.push(query.testCaseResult(testCaseResult).id);
        }
        break;
      }
    }
  }
});
