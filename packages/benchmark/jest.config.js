const PRESET = process.env.PRESET || 'metadata-N';

const mixins = {
  env: () => ({
    testEnvironment: 'jest-metadata/environment-node',
  }),
  reporter: (enable) => ({
    reporters: [
      ...(enable ? ['jest-metadata/reporter'] : []),
      './benchmarkReporter',
    ],
  }),
  workers: (n) => ({
    maxWorkers: n,
  }),
};

const presets = {
  'metadata-1': {
    ...mixins.env(),
    ...mixins.reporter(true),
    ...mixins.workers(3),
  },
  'metadata-N': {
    ...mixins.env(),
    ...mixins.reporter(true),
    ...mixins.workers(3),
  },
  'fallback-1': {
    ...mixins.reporter(true),
    ...mixins.workers(1),
  },
  'fallback-N': {
    ...mixins.reporter(true),
    ...mixins.workers(3),
  },
  'baseline-1': {
    ...mixins.reporter(false),
    ...mixins.workers(1),
  },
  'baseline-N': {
    ...mixins.reporter(false),
    ...mixins.workers(3),
  },
};

module.exports = {
  ...presets[PRESET],
};
