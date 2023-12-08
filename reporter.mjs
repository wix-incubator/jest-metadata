import reporter from './dist/reporter.js';

const { default: JestMetadataReporter } = reporter;

const query = JestMetadataReporter.query;
export { query, JestMetadataReporter };
export default JestMetadataReporter;
