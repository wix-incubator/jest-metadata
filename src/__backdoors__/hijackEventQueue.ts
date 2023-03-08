import { EventHandlerCallback } from '../services';
import realm from '../realms';

export function hijackEventQueue(handler: EventHandlerCallback) {
  realm.eventQueue.unregisterAllHandlers().registerHandler(handler);
}
