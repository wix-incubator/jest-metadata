import { Event } from '../events';

export type CircusTestEventHandlerConfig = {
  emit(event: Event): void;
  getInstanceId(instance: object): string;
};
