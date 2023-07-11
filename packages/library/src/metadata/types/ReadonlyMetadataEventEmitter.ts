import type { ReadonlyEmitter } from '../../types';
import type { MetadataEvent, MetadataEventType } from '../events';

export type ReadonlyMetadataEventEmitter = ReadonlyEmitter<MetadataEvent, MetadataEventType | '*'>;
