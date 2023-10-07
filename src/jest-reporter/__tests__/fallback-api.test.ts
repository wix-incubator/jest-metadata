import fixtures from '../../../e2e';
import type { IPCServer } from '../../ipc';
import {
  GlobalMetadataRegistry,
  MetadataEvent,
  MetadataEventEmitter,
  MetadataEventHandler,
  MetadataFactoryImpl,
  SetMetadataEventEmitter,
} from '../../metadata';
import { SerialSyncEmitter } from '../../utils';
import { AssociateMetadata } from '../AssociateMetadata';
import { FallbackAPI } from '../FallbackAPI';
import { ReporterServer } from '../ReporterServer';
import {QueryMetadata} from "../QueryMetadata";

describe('Fallback API', () => {
  let server: ReporterServer;
  let query: QueryMetadata;
  let metadataHandler: MetadataEventHandler;

  beforeEach(() => {
    const IPCServer = jest.requireMock('../../ipc').IPCServer;
    const ipc: jest.Mocked<IPCServer> = new IPCServer();

    const emitter = new SerialSyncEmitter<MetadataEvent>('core').on('*', (event: MetadataEvent) => {
      metadataHandler.handle(event);
    }) as MetadataEventEmitter;
    const setEmitter = new SerialSyncEmitter('set') as SetMetadataEventEmitter;
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
      expect(handle.mock.calls.map((args: any[]) => args[0])).toMatchSnapshot('emitted events');
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
