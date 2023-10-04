const MODE = process.env.MODE;
if (!MODE) {
  console.warn('No $MODE set, defaulting to "recorder"...');
}

module.exports = (!MODE || MODE === 'recorder')
  ? require('./jest-recorder.config')
  : require('./jest-benchmark.config');
