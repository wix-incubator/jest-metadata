import type { Emitter } from '../../types';
import type { MetadataEvent } from '../events';

export type MetadataEventEmitter = Emitter<MetadataEvent>;

export type MetadataEventEmitterCallback<T extends MetadataEvent = MetadataEvent> = (
  event: T,
) => void;
