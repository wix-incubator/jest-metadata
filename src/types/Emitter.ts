import { Event } from '../events';

export interface SyncEmitter {
  emit(event: Event): void;
}

export interface AsyncEmitter {
  emit(event: Event): Promise<void>;
}

export type Emitter = SyncEmitter | AsyncEmitter;
