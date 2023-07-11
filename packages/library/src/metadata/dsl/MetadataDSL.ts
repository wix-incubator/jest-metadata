import type { Data, Metadata, ReadonlyMetadataEventEmitter } from '../types';

const $metadata = Symbol('metadata');

const $emitter: unique symbol = Symbol('emitter');
const $deferred: unique symbol = Symbol('deferred');
const $schedule: unique symbol = Symbol('schedule');

export class MetadataDSL {
  private readonly [$metadata]: () => Metadata;
  private readonly [$emitter]: ReadonlyMetadataEventEmitter;
  private [$deferred] = true;

  constructor(emitter: ReadonlyMetadataEventEmitter, metadata: () => Metadata) {
    this[$metadata] = metadata;
    this[$emitter] = emitter
      .on('run_start', () => {
        // This allows to set metadata via fancy annotations before
        // actual addition of test hooks and functions, which improves
        // readability of the test files.
        this[$deferred] = false;
      })
      .on('add_test_file', () => {
        // When running `jest --runInBand`, the MetadataDSL instance is shared between
        // multiple test files. We need to reset the deferred state when a new test file
        // is added.
        this[$deferred] = true;
      });
  }

  $Get = (path: string | string[], fallbackValue?: unknown): unknown => {
    return this[$metadata]().get(path, fallbackValue);
  };

  $Set = (path: string | string[], value: unknown): void => {
    this[$schedule](() => {
      this[$metadata]().set(path, value);
    });
  };

  $Push = (path: string | string[], ...values: unknown[]): void => {
    this[$schedule](() => {
      const metadata = this[$metadata]();
      metadata.push(path, ...values);
    });
  };

  $Assign = (path: string | string[] | undefined, value: Data): void => {
    this[$schedule](() => {
      this[$metadata]().assign(path, value);
    });
  };

  $Merge = (path: string | string[] | undefined, value: Data): void => {
    this[$schedule](() => {
      this[$metadata]().merge(path, value);
    });
  };

  [$schedule](callback: () => void): void {
    if (this[$deferred]) {
      this[$emitter].once('*', callback);
    } else {
      callback();
    }
  }
}
