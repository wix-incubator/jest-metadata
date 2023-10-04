const path = require('path');
const globby = require('globby');

const fixturesDir = path.join(__dirname, '__fixtures__');
module.exports = globby.sync('*.x.x/**/*.json', { cwd: fixturesDir })
  .map(f => [path.join(path.dirname(f), path.basename(f, '.json')), require('./__fixtures__/' + f)]);
