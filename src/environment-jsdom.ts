import JestEnvironmentJsdom from 'jest-environment-jsdom';
import WithMetadata from './environment-decorator';

export default WithMetadata(JestEnvironmentJsdom);
