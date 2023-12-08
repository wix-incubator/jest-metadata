import type { JestEnvironment } from '@jest/environment';
import WithEmitter from 'jest-environment-emit';
import listener from './environment-listener';

const WithMetadata = <E extends JestEnvironment = JestEnvironment>(
  JestEnvironmentClass: new (...args: any[]) => E,
) => WithEmitter<E>(JestEnvironmentClass, listener, 'WithMetadata');

export default WithMetadata;
