import { RootEventHandler } from '../eventHandlers';
import { EventQueue, AggregatedMetadataRegistry } from '../services';

import { CircusTestEventHandler } from '../circus/CircusTestEventHandler';
import { CircusTestEventHandlerConfig } from '../circus/CircusTestEventHandlerConfig';

export class ChildProcessRealm {
  eventQueue = new EventQueue();
  aggregatedMetadataRegistry = new AggregatedMetadataRegistry();
  circusTestEventHandlerConfig = new CircusTestEventHandlerConfig(this.eventQueue);
  circusTestEventHandler = new CircusTestEventHandler(this.circusTestEventHandlerConfig);
  rootEventHandler = new RootEventHandler({
    eventQueue: this.eventQueue,
    aggregatedMetadataRegistry: this.aggregatedMetadataRegistry,
  });

  constructor(public readonly mode: boolean) {}
}
