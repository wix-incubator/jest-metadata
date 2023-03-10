import funpermaproxy from 'funpermaproxy';
import { Metadata, NamespacedMetadata } from './metadata';

function current(): Metadata {
  throw new Error('not implemented');
}

export function namespaced(name?: string) {
  return name ? new NamespacedMetadata(name, current) : metadata;
}

export const metadata: Metadata = funpermaproxy(current);
