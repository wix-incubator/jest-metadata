const path = require('path');
const CI = require('is-ci');

const PRESET = process.env.PRESET || 'env-1';

const mixins = {
  env: () => ({
    testEnvironment: 'jest-metadata/environment-node',
  }),
  workers: (n) => ({
    maxWorkers: n,
  }),
};

const presets = {
  'env-1': {
    ...mixins.env(),
    ...mixins.workers(1),
  },
  'env-N': {
    ...mixins.env(),
    ...mixins.workers(2),
  },
  'no-env-1': {
    ...mixins.workers(1),
  },
  'no-env-N': {
    ...mixins.workers(2),
  },
};

module.exports = {
  collectCoverage: CI,
  coverageDirectory: path.join(__dirname, '../../coverage', PRESET),

  reporters: [
    'default',
    '<rootDir>/mockReporter'
  ],

  ...presets[PRESET],
};



