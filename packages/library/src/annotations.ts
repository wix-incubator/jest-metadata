import funpermaproxy from 'funpermaproxy';
import { Metadata, MetadataDSL, NamespacedMetadata } from './metadata';
import { realm } from './realms';

function getCurrentMetadata(): Metadata {
  const { aggregatedResult } = realm.metadataRegistry;
  const run = aggregatedResult.lastTestResult;

  return run ? run.current.value() ?? run : aggregatedResult;
}

const currentMetadata = funpermaproxy(getCurrentMetadata);

export function namespaced(name?: string) {
  return new MetadataDSL(
    realm.rootEmitter,
    name ? new NamespacedMetadata(name, getCurrentMetadata) : currentMetadata,
  );
}

const currentMetadataDSL = namespaced();
export const $Get = currentMetadataDSL.$Get;
export const $Set = currentMetadataDSL.$Set;
export const $Assign = currentMetadataDSL.$Assign;
export const $Merge = currentMetadataDSL.$Merge;
