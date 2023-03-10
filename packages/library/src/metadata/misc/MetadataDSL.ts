import type { Data, Metadata } from '../containers';

import type { MetadataEventEmitter } from './MetadataEventEmitter';
import type { NamespacedMetadata } from './NamespacedMetadata';

const $metadata = Symbol('metadata');

const $emitter: unique symbol = Symbol('emitter');
const $deferred: unique symbol = Symbol('deferred');

export class MetadataDSL {
  private readonly [$metadata]: Metadata | NamespacedMetadata;
  private readonly [$emitter]: MetadataEventEmitter;
  private [$deferred] = true;

  constructor(emitter: MetadataEventEmitter, metadata: Metadata | NamespacedMetadata) {
    this[$metadata] = metadata;
    this[$emitter] = emitter.once('run_start', () => {
      this[$deferred] = false;
    });
  }

  $Get(path: string | string[], fallbackValue?: unknown): unknown {
    return this[$metadata].get(path, fallbackValue);
  }

  $Set(path: string | string[], value: unknown): void {
    if (this[$deferred]) {
      this[$emitter].once('*', () => {
        this[$metadata].set(path, value);
      });
    } else {
      this[$metadata].set(path, value);
    }
  }

  $Assign(path: string | string[] | undefined, value: Data): void {
    if (this[$deferred]) {
      this[$emitter].once('*', () => {
        this[$metadata].assign(path, value);
      });
    } else {
      this[$metadata].assign(path, value);
    }
  }

  $Merge(path: string | string[] | undefined, value: Data): void {
    if (this[$deferred]) {
      this[$emitter].once('*', () => {
        this[$metadata].merge(path, value);
      });
    } else {
      this[$metadata].merge(path, value);
    }
  }
}
