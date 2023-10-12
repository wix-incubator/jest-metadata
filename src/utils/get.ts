export function get<T>(obj: unknown, path: string | readonly string[]): T | undefined;
export function get<T>(obj: unknown, path: string | readonly string[], defaultValue: T): T;
export function get<T = unknown>(
  obj: unknown,
  path: string | readonly string[],
  defaultValue?: T,
): T | undefined {
  if (obj == null) {
    return defaultValue;
  }

  const pathArray = typeof path === 'string' ? path.split('.') : path;
  let it: any = obj;

  for (const key of pathArray) {
    if (it[key] === undefined) {
      return defaultValue;
    }
    it = it[key];
  }

  return it;
}
