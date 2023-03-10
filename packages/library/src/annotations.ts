import funpermaproxy from 'funpermaproxy';
import { Metadata, MetadataDSL, MetadataEventEmitter, NamespacedMetadata } from './metadata';

function getCurrentMetadata(): Metadata {
  throw new Error('not implemented');
}

function getEmitter(): MetadataEventEmitter {
  throw new Error('not implemented');
}

const currentMetadata = funpermaproxy(getCurrentMetadata);

export function namespaced(name?: string) {
  return new MetadataDSL(
    getEmitter(),
    name ? new NamespacedMetadata(name, getCurrentMetadata) : currentMetadata,
  );
}

const currentMetadataDSL = namespaced();
export const $Get = currentMetadataDSL.$Get;
export const $Set = currentMetadataDSL.$Set;
export const $Assign = currentMetadataDSL.$Assign;
export const $Merge = currentMetadataDSL.$Merge;
