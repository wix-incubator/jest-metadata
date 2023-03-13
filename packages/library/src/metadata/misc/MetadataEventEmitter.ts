import { Emitter } from '../../types';
import { MetadataEvent, SetMetadataEvent } from '../events';

export type MetadataEventEmitter = Emitter<MetadataEvent>;
export type SetMetadataEventEmitter = Emitter<SetMetadataEvent>;

export type MetadataEventEmitterCallback<T extends MetadataEvent = MetadataEvent> = (
  event: T,
) => void;
