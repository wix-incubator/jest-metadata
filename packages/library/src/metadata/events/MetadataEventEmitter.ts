import { MetadataEvent } from './MetadataEvent';

export type MetadataEventEmitterCallback<T extends MetadataEvent = MetadataEvent> = (
  event: T,
) => void;

export interface MetadataEventEmitter {
  emit(event: MetadataEvent): void;
}
