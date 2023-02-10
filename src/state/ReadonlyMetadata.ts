import { Metadata } from './Metadata';

export type ReadonlyMetadata<T extends Metadata> = Omit<T, 'set' | 'assign' | 'merge' | 'flush'>;
