import { Event } from '../events';

export type MetadataProperties = {
  id: string;
  emit: (event: Event) => void;
};
