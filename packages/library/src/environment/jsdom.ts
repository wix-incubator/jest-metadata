import importCwd from 'import-cwd';

import Metadata from './hoc';

const JestEnvironmentJsdom: any = importCwd('jest-environment-jsdom');

export default Metadata(JestEnvironmentJsdom);
