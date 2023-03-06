import { EventHandler } from '../../services';
import { eventQueue } from '../state';

export function hijackEventQueue(handler: EventHandler) {
  eventQueue.unregisterAllHandlers().registerHandler(handler);
}
