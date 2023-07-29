const fs = require('fs');
const path = require('path');
const globby = require('globby');

module.exports = globby.sync('*.x.x/**/*.json', { cwd: __dirname })
  .map(f => [path.join(path.dirname(f), path.basename(f, '.json')), require('./' + f)]);
