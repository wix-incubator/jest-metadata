import JestEnvironmentNode from 'jest-environment-node';
import { WithMetadata } from './environment-decorator';

export const TestEnvironment = WithMetadata(JestEnvironmentNode);
export default TestEnvironment;
