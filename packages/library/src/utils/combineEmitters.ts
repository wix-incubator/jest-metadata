import type { ReadonlyEmitter } from '../types';
import { SerialEmitter } from './SerialEmitter';

export function combineEmitters<A extends { type: string }, B extends { type: string }>(
  a: ReadonlyEmitter<A>,
  b: ReadonlyEmitter<B>,
): ReadonlyEmitter<A | B> {
  const emitter = new SerialEmitter<A | B>();
  a.on('*', (event) => emitter.emit(event));
  b.on('*', (event) => emitter.emit(event));
  return emitter;
}
