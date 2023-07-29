/* eslint-disable prefer-rest-params,unicorn/no-for-loop */

export function memoizeLast<T extends (...args: any[]) => any>(fn: T): T {
  let lastArgs: IArguments;
  let lastResult: any;

  return function memoized(this: unknown) {
    if (!lastArgs || !areArgumentsEqual(lastArgs, arguments)) {
      lastArgs = arguments;
      lastResult = Reflect.apply(fn, this, arguments);
    }

    return lastResult;
  } as T;
}

function areArgumentsEqual(args1: IArguments, args2: IArguments): boolean {
  if (args1.length !== args2.length) {
    return false;
  }

  for (let i = 0; i < args1.length; i++) {
    if (args1[i] !== args2[i]) {
      return false;
    }
  }

  return true;
}
