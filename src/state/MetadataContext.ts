import { Event } from '../events';
import { Metadata } from './Metadata';

export type MetadataContext = {
  emit: (event: Event) => void;
  register: (id: string, metadata: Metadata) => void;
};
