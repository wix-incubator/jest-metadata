export function* iterateSorted<T>(
  getIndex: (x: T) => number,
  a: Iterable<T>,
  b: Iterable<T>,
): IterableIterator<T> {
  if (a === b) {
    yield* a;
    return;
  }

  const ia = a[Symbol.iterator]();
  const ib = b[Symbol.iterator]();

  let ea = ia.next();
  let eb = ib.next();

  while (!ea.done && !eb.done) {
    const va = ea.value;
    const vb = eb.value;

    const na = getIndex(va);
    const nb = getIndex(vb);

    if (na <= nb) {
      yield va;
      ea = ia.next();
    } else {
      yield vb;
      eb = ib.next();
    }
  }

  while (!ea.done) {
    yield ea.value;
    ea = ia.next();
  }

  while (!eb.done) {
    yield eb.value;
    eb = ib.next();
  }
}
