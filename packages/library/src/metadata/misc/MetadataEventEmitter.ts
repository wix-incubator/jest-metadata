import { SimpleEmitter } from '../../utils';
import { MetadataEvent } from '../events';

export class MetadataEventEmitter extends SimpleEmitter<MetadataEvent> {}

export type MetadataEventEmitterCallback<T extends MetadataEvent = MetadataEvent> = (
  event: T,
) => void;
