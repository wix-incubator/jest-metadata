import { isPrimitive } from './isPrimitive';

export function set(obj: unknown, path: string | readonly string[], value: unknown): void {
  if (isPrimitive(obj)) {
    return;
  }

  const pathArray = typeof path === 'string' ? path.split('.') : path;
  let it: any = obj;

  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];
    if (isUnsafeKey(key)) {
      return;
    }

    if (i === pathArray.length - 1) {
      // If it's the last key in the path
      it[key] = value;
    } else {
      if (it[key] === undefined) {
        it[key] = {};
      }
      it = it[key];
    }
  }
}

function isUnsafeKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}
