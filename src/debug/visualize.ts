import fs from 'node:fs/promises';
import {
  GlobalMetadataRegistry,
  type MetadataEvent,
  MetadataEventHandler,
  MetadataFactoryImpl,
  type WriteMetadataEventEmitter,
} from '../metadata';
import { SerialEmitter } from '../utils';
import { PlantSerializer } from './plant';

export async function visualize(traceJsonFile: string | MetadataEvent[]) {
  const events: MetadataEvent[] = Array.isArray(traceJsonFile)
    ? traceJsonFile
    : await readEvents(traceJsonFile);

  return replayEvents(events);
}

async function readEvents(traceJsonFile: string): Promise<MetadataEvent[]> {
  const raw = await fs.readFile(traceJsonFile, 'utf8');
  const json = JSON.parse(raw) as any[];
  const mainPID = json[0].pid;
  const events: MetadataEvent[] = [];
  for (const event of json) {
    const { cat, pid, args } = event;
    if (pid === mainPID && args?.event?.type && cat?.includes('emitter-events')) {
      events.push(args.event as MetadataEvent);
    }
  }

  return events;
}

function replayEvents(events: MetadataEvent[]) {
  const emitter: WriteMetadataEventEmitter = new SerialEmitter('set');
  const metadataRegistry = new GlobalMetadataRegistry();
  const metadataFactory = new MetadataFactoryImpl(metadataRegistry, emitter);
  const globalMetadata = metadataFactory.createGlobalMetadata();
  const eventHandler = new MetadataEventHandler({
    globalMetadata,
    metadataRegistry,
  });

  for (const event of events) {
    eventHandler.handle(event);
  }

  return PlantSerializer.serialize(metadataFactory.checker, metadataRegistry);
}
