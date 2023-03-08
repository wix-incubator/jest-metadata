import { RootEventHandler } from '../eventHandlers';
import { EventQueue, AggregatedMetadataRegistry } from '../services';

import { CircusTestEventHandler } from '../circus/CircusTestEventHandler';

export class ChildProcessRealm {
  eventQueue = new EventQueue();
  aggregatedMetadataRegistry = new AggregatedMetadataRegistry();
  circusTestEventHandler = new CircusTestEventHandler({
    eventQueue: this.eventQueue,
  });
  rootEventHandler = new RootEventHandler({
    eventQueue: this.eventQueue,
    aggregatedMetadataRegistry: this.aggregatedMetadataRegistry,
  });

  constructor(public readonly mode: boolean) {}
}
