import { JestMetadataError } from '../../errors';
import { logger } from '../../utils';
import type { Data, Metadata, ReadonlyMetadataEventEmitter } from '../types';

const log = logger.child({ cat: 'dsl', tid: 'jest-metadata' });

export class MetadataDSL {
  readonly #metadata: () => Metadata;
  readonly #emitter: ReadonlyMetadataEventEmitter;
  readonly #scheduled = new Set<() => void>();
  #configured = false;
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
      .on('setup', () => {
        // Assert that the metadata gets Circus events from TestEnvironment.handleTestEvent.
        this.#configured = true;
      })
      .on('add_test_file', () => {
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

  $Unshift = (path: string | readonly string[], ...values: unknown[]): void => {
    this.#assertPath(path);
    this.#assertValues(values);

    this.schedule(() => {
      const metadata = this.#metadata();
      metadata.unshift(path, values);
    });
  };

  $Assign = (path: string | readonly string[] | undefined, value: Data): void => {
    this.#assertPath(path);
    this.#assertValue(value);

    this.schedule(() => {
      this.#metadata().assign(path, value);
    });
  };

  $Defaults = (path: string | readonly string[] | undefined, value: Data): void => {
    this.#assertPath(path);
    this.#assertValue(value);

    this.schedule(() => {
      this.#metadata().defaults(path, value);
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
    if (!this.#assertConfigured()) {
      return;
    }
    this.#assertNotRunning();

    const callbackAutoDelete = () => {
      this.#scheduled.delete(callbackAutoDelete);
      return callback();
    };

    this.#scheduled.add(callbackAutoDelete);
    this.#emitter.once('*', callbackAutoDelete);
  }

  #assertConfigured(): boolean {
    if (!this.#configured) {
      log.warn(
        `Cannot use "jest-metadata" annotations because the test environment is not properly configured.
There are two possible reasons for this:
1. You are using a standard Jest environment (e.g. "jest-environment-node") and not using "jest-metadata/environment-*" packages.
2. You are a non-supported test runner (e.g. "jest-jasmine2") instead of "jest-circus".
  If this is not the case, then something is broken between your Jest configuration and jest-metadata environment.`,
      );
    }

    return this.#configured;
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
