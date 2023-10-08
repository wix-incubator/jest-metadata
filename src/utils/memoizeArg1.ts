/* eslint-disable prefer-rest-params,unicorn/no-for-loop */

export function memoizeArg1<T extends (...args: any[]) => any>(getFn: () => T): T {
  const instances = new Map<unknown, T>();

  return function memoized(this: unknown, arg1: unknown) {
    if (!instances.has(arg1)) {
      instances.set(arg1, getFn());
    }

    const fn = instances.get(arg1)!;
    return Reflect.apply(fn, this, arguments);
  } as T;
}
