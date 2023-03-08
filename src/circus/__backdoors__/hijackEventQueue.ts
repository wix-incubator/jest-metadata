import { EventHandlerCallback } from '../../services';
import { eventQueue } from '../../state';

export function hijackEventQueue(handler: EventHandlerCallback) {
  eventQueue.unregisterAllHandlers().registerHandler(handler);
}
