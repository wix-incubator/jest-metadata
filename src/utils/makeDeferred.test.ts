import { makeDeferred } from './makeDeferred';

describe('makeDeferred', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return an object with promise, resolve, and reject properties', () => {
    const deferred = makeDeferred<any>();
    expect(deferred).toHaveProperty('promise');
    expect(deferred).toHaveProperty('resolve');
    expect(deferred).toHaveProperty('reject');
  });

  it('should resolve the promise when the resolve function is called', async () => {
    let resolvedValue: string | undefined;
    const deferred = makeDeferred<string>();

    setTimeout(() => deferred.resolve('resolved value'), 1000);

    deferred.promise.then((value) => {
      resolvedValue = value;
    });

    expect(resolvedValue).toBeUndefined(); // The promise should not have resolved yet

    jest.runAllTimers(); // Advance all timers
    await deferred.promise; // Wait for the promise to resolve

    expect(resolvedValue).toBe('resolved value');
  });

  it('should reject the promise when the reject function is called', async () => {
    let errorValue: Error | undefined;
    const deferred = makeDeferred<string>();

    setTimeout(() => deferred.reject(new Error('rejection reason')), 1000);

    deferred.promise.catch((error) => {
      errorValue = error;
    });

    expect(errorValue).toBeUndefined(); // The promise should not have rejected yet

    jest.runAllTimers(); // Advance all timers
    try {
      await deferred.promise;
    } catch (error: any) {
      // Expect the rejection
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('rejection reason');
    }

    expect(errorValue).toBeInstanceOf(Error);
    expect(errorValue?.message).toBe('rejection reason');
  });
});
