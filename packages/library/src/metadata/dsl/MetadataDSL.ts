import { JestMetadataError } from '../../errors';
import type { Data, Metadata, ReadonlyMetadataEventEmitter } from '../types';

export class MetadataDSL {
  readonly #metadata: () => Metadata;
  readonly #emitter: ReadonlyMetadataEventEmitter;
  readonly #scheduled = new Set<() => void>();
  #initialized = false;
  #running = false;

  constructor(emitter: ReadonlyMetadataEventEmitter, metadata: () => Metadata) {
    this.#metadata = metadata;
    this.#emitter = emitter
      .on('run_start', () => {
        // In running mode, we don't want to allow any changes to the metadata
        // via pseudo-annotations. This is to prevent any accidental changes
        // to the metadata during the test run.
        this.#running = true;
        // Any remaining scheduled callbacks are considered invalid and will be
        // immediately removed to prevent incorrect metadata changes.
        for (const callback of this.#scheduled) {
          this.#emitter.off('*', callback);
        }
        this.#scheduled.clear();
      })
      .on('add_test_file', () => {
        // Assert that the metadata is not disconnected from the emitter.
        // TODO: move to 'setup' Circus event
        this.#initialized = true;
        // When running `jest --runInBand`, the MetadataDSL instance is shared between
        // multiple test files. We need to reset the running mode, when a new test file
        // is added.
        this.#running = false;
      });
  }

  $Set = (path: string | readonly string[], value: unknown): void => {
    this.#assertPath(path);

    this.schedule(() => {
      this.#metadata().set(path, value);
    });
  };

  $Push = (path: string | readonly string[], ...values: unknown[]): void => {
    this.#assertPath(path);
    this.#assertValues(values);

    this.schedule(() => {
      const metadata = this.#metadata();
      metadata.push(path, values);
    });
  };

  $Assign = (path: string | readonly string[] | undefined, value: Data): void => {
    this.#assertPath(path);
    this.#assertValue(value);

    this.schedule(() => {
      this.#metadata().assign(path, value);
    });
  };

  $Merge = (path: string | readonly string[] | undefined, value: Data): void => {
    this.#assertPath(path);
    this.#assertValue(value);

    this.schedule(() => {
      this.#metadata().merge(path, value);
    });
  };

  protected schedule(callback: () => void): void {
    this.#assertInitialized();
    this.#assertNotRunning();

    const callbackAutoDelete = () => {
      this.#scheduled.delete(callbackAutoDelete);
      return callback();
    };

    this.#scheduled.add(callbackAutoDelete);
    this.#emitter.once('*', callbackAutoDelete);
  }

  #assertInitialized(): void {
    if (!this.#initialized) {
      console.warn('TODO: come up with a better error message');
    }
  }

  #assertNotRunning(): void {
    if (this.#running) {
      throw new JestMetadataError('Cannot apply annotations when tests are already running.');
    }
  }

  #assertPath(path: string | readonly string[] | undefined): void {
    if (path === undefined) {
      throw new JestMetadataError('Cannot apply annotations without a path.');
    }
  }

  #assertValue(value: Data): void {
    if (value === undefined) {
      throw new JestMetadataError('Cannot apply annotations without a defined value.');
    }
  }

  #assertValues(values: unknown[]): void {
    if (values.length === 0) {
      throw new JestMetadataError('Cannot apply annotations without values.');
    }
  }
}
