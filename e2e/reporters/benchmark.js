const fs = require('fs');

/**
 * @implements {import('@jest/reporters').Reporter}
 */
class BenchmarkReporter {
  onRunComplete(testContexts, results) {
    const duration = Date.now() - results.startTime;
    const preset = process.env.PRESET;
    const numTests = results.numTotalTests;

    if (preset) {
      let results;
      try {
        results = JSON.parse(fs.readFileSync('benchmark.json', 'utf8'));
      } catch {
        results = {};
      }

      results[numTests] = results[numTests] || {};
      results[numTests][preset] = duration;

      fs.writeFileSync('benchmark.json', JSON.stringify(results, null, 2));
    }
  }
}

module.exports = BenchmarkReporter;
