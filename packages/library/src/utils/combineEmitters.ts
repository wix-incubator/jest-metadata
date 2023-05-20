import type { ReadonlyEmitter } from '../types';
import { SerialEmitter } from './SerialEmitter';

export function combineEmitters<A extends { type: string }, B extends { type: string }>(
  a: ReadonlyEmitter<A>,
  b: ReadonlyEmitter<B>,
): ReadonlyEmitter<A | B> {
  const reemitter = new SerialEmitter<A | B>('combined');
  a.on('*', (event) => /* A */ reemitter.emit(event));
  b.on('*', (event) => /* B */ reemitter.emit(event));
  return reemitter;
}
