const path = require('path');
const globby = require('globby');

const fixturesDir = path.join(__dirname, '__fixtures__');

const getEvents = (glob, filterFn) => {
  return globby.sync(`*.x.x/${glob}/*.json`, { cwd: fixturesDir })
    .map(f => [
      path.join(path.dirname(f), path.basename(f, '.json')).replaceAll(path.win32.sep, path.posix.sep),
      require('./__fixtures__/' + f).filter(filterFn),
    ]);
};

module.exports = {
  metadata: [
    ...getEvents('env-N', e => !e.type.startsWith('reporter:')),
    ...getEvents('bail-env-*', e => !e.type.startsWith('reporter:')),
  ],
  reporter: [
    ...getEvents('no-env-N', e => e.type.startsWith('reporter:')),
    ...getEvents('bail-no-env-*', e => e.type.startsWith('reporter:')),
  ],
};
